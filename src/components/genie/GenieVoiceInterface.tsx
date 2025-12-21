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

      // Get ephemeral token from edge function
      const { data, error } = await supabase.functions.invoke("genie-voice-token", {
        body: { memoryContext },
      });

      if (error || !data?.client_secret?.value) {
        throw new Error(error?.message || "Failed to get voice token");
      }

      const EPHEMERAL_KEY = data.client_secret.value;

      // Create peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Set up remote audio
      pc.ontrack = (e) => {
        if (audioElRef.current) {
          audioElRef.current.srcObject = e.streams[0];
        }
      };

      // Add local audio track
      pc.addTrack(stream.getTracks()[0]);

      // Set up data channel
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.addEventListener("open", () => {
        console.log("Data channel open");
      });

      dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        console.log("Received event:", event.type);

        if (event.type === "response.audio_transcript.delta") {
          // Assistant is speaking
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
        } else if (event.type === "error") {
          console.error("Voice error:", event.error);
          toast.error("Voice error: " + (event.error?.message || "Unknown error"));
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

      await pc.setRemoteDescription(answer);
      setIsConnected(true);
      toast.success("Voice connected. Start speaking!");
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
