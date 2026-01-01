import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, PhoneOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import VoiceWaveform from "./VoiceWaveform";

interface GenieVoiceInterfaceProps {
  memoryContext?: string;
  onTranscript?: (text: string, role: "user" | "assistant") => void;
}

export default function GenieVoiceInterface({ memoryContext, onTranscript }: GenieVoiceInterfaceProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Create audio element for playback
    audioElRef.current = document.createElement("audio");
    audioElRef.current.autoplay = true;

    return () => {
      disconnect();
    };
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Get the user's session for proper JWT authentication
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.access_token) {
        throw new Error("Not authenticated. Please log in to use voice.");
      }

      // Get ephemeral token from edge function with JWT auth
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/genie-voice-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ memoryContext }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get voice token");
      }

      const data = await response.json();

      if (!data?.client_secret?.value) {
        throw new Error("Failed to get voice token from server");
      }
      const EPHEMERAL_KEY = data.client_secret.value;

      // Create peer connection with STUN servers for better connectivity
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
        ],
      });
      pcRef.current = pc;

      // Log connection state changes
      pc.onconnectionstatechange = () => {
        console.log("[Voice] Connection state:", pc.connectionState);
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          toast.error("Voice connection lost. Please reconnect.");
          disconnect();
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log("[Voice] ICE connection state:", pc.iceConnectionState);
      };

      // Set up remote audio
      pc.ontrack = (e) => {
        console.log("[Voice] Received remote track:", e.track.kind);
        if (audioElRef.current) {
          audioElRef.current.srcObject = e.streams[0];
          // Ensure audio plays
          audioElRef.current.play().catch(err => {
            console.error("[Voice] Audio play failed:", err);
          });
        }
      };

      // Add local audio track
      const audioTrack = stream.getTracks()[0];
      console.log("[Voice] Adding local audio track:", audioTrack.label);
      pc.addTrack(audioTrack);

      // Set up data channel
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.addEventListener("open", () => {
        console.log("[Voice] Data channel open - ready for conversation");
        toast.success("Voice connected! Start speaking.");
      });

      dc.addEventListener("error", (e) => {
        console.error("[Voice] Data channel error:", e);
      });

      dc.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log("[Voice] Event:", event.type);

          if (event.type === "session.created") {
            console.log("[Voice] Session created:", event.session?.id);
          } else if (event.type === "response.audio.delta") {
            // Audio is being received
            setIsSpeaking(true);
          } else if (event.type === "response.audio_transcript.delta") {
            setIsSpeaking(true);
          } else if (event.type === "response.audio_transcript.done") {
            setIsSpeaking(false);
            if (onTranscript && event.transcript) {
              onTranscript(event.transcript, "assistant");
            }
          } else if (event.type === "conversation.item.input_audio_transcription.completed") {
            if (onTranscript && event.transcript) {
              onTranscript(event.transcript, "user");
            }
          } else if (event.type === "response.done") {
            setIsSpeaking(false);
          } else if (event.type === "input_audio_buffer.speech_started") {
            console.log("[Voice] User started speaking");
          } else if (event.type === "input_audio_buffer.speech_stopped") {
            console.log("[Voice] User stopped speaking");
          } else if (event.type === "error") {
            console.error("[Voice] API error:", event.error);
            toast.error("Voice error: " + (event.error?.message || "Unknown error"));
          }
        } catch (err) {
          console.error("[Voice] Failed to parse event:", err);
        }
      });

      // Create and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Connect to OpenAI's Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        throw new Error("Failed to connect to voice API");
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };

      console.log("[Voice] WebRTC connection established");
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting voice:", error);
      toast.error(error instanceof Error ? error.message : "Failed to connect voice");
      disconnect();
    } finally {
      setIsConnecting(false);
    }
  }, [memoryContext, onTranscript]);

  const disconnect = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (audioElRef.current) {
      audioElRef.current.srcObject = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {!isConnected ? (
        <Button
          variant="outline"
          size="sm"
          onClick={connect}
          disabled={isConnecting}
          className="gap-2"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Phone className="h-4 w-4" />
              Voice
            </>
          )}
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30">
            <VoiceWaveform isActive={true} isSpeaking={isSpeaking} barCount={5} />
            <span className="text-xs text-muted-foreground">
              {isSpeaking ? (
                <span className="text-accent">Genie speaking...</span>
              ) : (
                "Listening..."
              )}
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={disconnect}
            className="gap-2"
          >
            <PhoneOff className="h-4 w-4" />
            End
          </Button>
        </div>
      )}
    </div>
  );
}
