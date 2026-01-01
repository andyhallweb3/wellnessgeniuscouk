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
      audioTrack.enabled = true;
      console.log("[Voice] Adding local audio track:", audioTrack.label, "enabled=", audioTrack.enabled);
      pc.addTrack(audioTrack, stream);

      // Set up data channel
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      const sendEvent = (payload: unknown) => {
        if (dc.readyState !== "open") return;
        const msg = JSON.stringify(payload);
        console.log("[Voice] Sending event:", (payload as any)?.type);
        dc.send(msg);
      };

      dc.addEventListener("open", () => {
        console.log("[Voice] Data channel open - ready for conversation");
        setIsConnected(true);
        toast.success("Voice connected! Start speaking.");

        // Force a first turn so users immediately hear/see something.
        // This also validates that the Realtime session is actually responding.
        sendEvent({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [{ type: "input_text", text: "Confirm you can hear me. Say: connected." }],
          },
        });
        sendEvent({ type: "response.create" });
      });

      dc.addEventListener("error", (e) => {
        console.error("[Voice] Data channel error:", e);
      });

      dc.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log("[Voice] Event:", event.type, event);

          if (event.type === "session.created") {
            console.log("[Voice] Session created:", event.session?.id);

            // Ensure the session is configured for audio + transcription + server VAD.
            // (In some environments the server-side session payload isn't fully applied
            // until we explicitly update after session.created.)
            sendEvent({
              type: "session.update",
              session: {
                modalities: ["text", "audio"],
                input_audio_transcription: { model: "whisper-1" },
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 800,
                  create_response: true,
                },
              },
            });
          } else if (event.type === "session.updated") {
            console.log("[Voice] Session updated");
          } else if (event.type === "response.audio.delta") {
            setIsSpeaking(true);
          } else if (event.type === "response.audio_transcript.delta") {
            console.log("[Voice] Assistant speaking (partial):", event.delta);
            setIsSpeaking(true);
          } else if (event.type === "response.audio_transcript.done") {
            console.log("[Voice] Assistant finished speaking:", event.transcript);
            setIsSpeaking(false);
            if (onTranscript && event.transcript) {
              console.log("[Voice] Posting assistant message to chat:", event.transcript);
              onTranscript(event.transcript, "assistant");
            }
          } else if (event.type === "conversation.item.input_audio_transcription.completed") {
            console.log("[Voice] User said:", event.transcript);
            if (onTranscript && event.transcript) {
              console.log("[Voice] Posting user message to chat:", event.transcript);
              onTranscript(event.transcript, "user");
            }
          } else if (event.type === "response.created") {
            console.log("[Voice] Response started");
          } else if (event.type === "response.done") {
            console.log("[Voice] Response complete");
            setIsSpeaking(false);
          } else if (event.type === "input_audio_buffer.speech_started") {
            console.log("[Voice] User started speaking");
          } else if (event.type === "input_audio_buffer.speech_stopped") {
            console.log("[Voice] User stopped speaking");
          } else if (event.type === "input_audio_buffer.committed") {
            console.log("[Voice] Audio buffer committed");
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

      // IMPORTANT: gather ICE candidates. Some networks never flip to "complete",
      // so we resolve when we either (a) complete, (b) get at least 1 candidate,
      // or (c) hit a soft timeout and proceed with best-effort SDP.
      let candidateCount = 0;
      await new Promise<void>((resolve) => {
        const cleanup = () => {
          pc.removeEventListener("icegatheringstatechange", onStateChange);
          pc.removeEventListener("icecandidate", onIceCandidate);
          window.clearTimeout(softTimeout);
          window.clearTimeout(hardTimeout);
        };

        const onStateChange = () => {
          console.log("[Voice] ICE gathering state:", pc.iceGatheringState);
          if (pc.iceGatheringState === "complete") {
            cleanup();
            resolve();
          }
        };

        const onIceCandidate = (ev: RTCPeerConnectionIceEvent) => {
          if (ev.candidate) {
            candidateCount += 1;
            return;
          }
          // null candidate = end of candidates in many browsers
          console.log("[Voice] ICE candidate gathering finished (null candidate)");
          cleanup();
          resolve();
        };

        pc.addEventListener("icegatheringstatechange", onStateChange);
        pc.addEventListener("icecandidate", onIceCandidate);

        // Soft timeout: if we got at least one candidate, proceed even if not "complete".
        const softTimeout = window.setTimeout(() => {
          if (candidateCount > 0) {
            console.warn("[Voice] ICE not complete but candidates found; proceeding.");
            cleanup();
            resolve();
          }
        }, 2000);

        // Hard timeout: proceed regardless; we'll validate candidateCount after.
        const hardTimeout = window.setTimeout(() => {
          console.warn("[Voice] ICE gathering timed out; proceeding with best-effort SDP.");
          cleanup();
          resolve();
        }, 15000);

        // Immediate resolve if already complete.
        if (pc.iceGatheringState === "complete") {
          cleanup();
          resolve();
        }
      });

      console.log("[Voice] Local ICE candidates gathered:", candidateCount);
      if (candidateCount === 0) {
        throw new Error(
          "Voice can't connect on this network (ICE blocked). Try disabling VPN or switching network."
        );
      }

      const offerSdp = pc.localDescription?.sdp;
      if (!offerSdp) throw new Error("Missing local SDP offer");

      // Connect to OpenAI's Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offerSdp,
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
      console.log("[Voice] WebRTC remote description set");
      // Note: we mark UI as connected only when the data channel opens.
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
