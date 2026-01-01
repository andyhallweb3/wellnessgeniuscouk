import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, PhoneOff, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import VoiceWaveform from "./VoiceWaveform";
import { useVoiceWebSocket } from "@/hooks/useVoiceWebSocket";

interface GenieVoiceInterfaceProps {
  memoryContext?: string;
  onTranscript?: (text: string, role: "user" | "assistant") => void;
}

type ConnectionMode = "idle" | "webrtc" | "websocket";

export default function GenieVoiceInterface({ memoryContext, onTranscript }: GenieVoiceInterfaceProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>("idle");
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // WebSocket fallback hook
  const wsVoice = useVoiceWebSocket({
    memoryContext,
    onTranscript,
  });

  useEffect(() => {
    // Create audio element for playback
    audioElRef.current = document.createElement("audio");
    audioElRef.current.autoplay = true;

    return () => {
      disconnectWebRTC();
    };
  }, []);

  const disconnectWebRTC = useCallback(() => {
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
    setConnectionMode("idle");
  }, []);

  const connectWebRTC = useCallback(async (): Promise<boolean> => {
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
          disconnectWebRTC();
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
        console.log("[Voice] Sending event:", (payload as Record<string, unknown>)?.type);
        dc.send(msg);
      };

      // Promise that resolves when data channel opens, or rejects on timeout
      const dcOpenPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Data channel didn't open in time"));
        }, 15000);

        dc.addEventListener("open", () => {
          clearTimeout(timeout);
          console.log("[Voice] Data channel open - ready for conversation");
          resolve();
        });

        dc.addEventListener("error", (e) => {
          clearTimeout(timeout);
          console.error("[Voice] Data channel error:", e);
          reject(new Error("Data channel error"));
        });
      });

      dc.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log("[Voice] Event:", event.type);

          if (event.type === "session.created") {
            console.log("[Voice] Session created:", event.session?.id);

            // Ensure the session is configured for audio + transcription + server VAD.
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

      // Gather ICE candidates
      let candidateCount = 0;
      await new Promise<void>((resolve) => {
        const cleanup = () => {
          pc.removeEventListener("icegatheringstatechange", onStateChange);
          pc.removeEventListener("icecandidate", onIceCandidate);
          clearTimeout(softTimeout);
          clearTimeout(hardTimeout);
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
          console.log("[Voice] ICE candidate gathering finished (null candidate)");
          cleanup();
          resolve();
        };

        pc.addEventListener("icegatheringstatechange", onStateChange);
        pc.addEventListener("icecandidate", onIceCandidate);

        const softTimeout = setTimeout(() => {
          if (candidateCount > 0) {
            console.warn("[Voice] ICE not complete but candidates found; proceeding.");
            cleanup();
            resolve();
          }
        }, 2000);

        const hardTimeout = setTimeout(() => {
          console.warn("[Voice] ICE gathering timed out; proceeding with best-effort SDP.");
          cleanup();
          resolve();
        }, 8000);

        if (pc.iceGatheringState === "complete") {
          cleanup();
          resolve();
        }
      });

      console.log("[Voice] Local ICE candidates gathered:", candidateCount);
      if (candidateCount === 0) {
        throw new Error("ICE_BLOCKED");
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

      // Wait for data channel to actually open
      await dcOpenPromise;

      // Send test message and set as connected
      sendEvent({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: "Confirm you can hear me. Say: connected." }],
        },
      });
      sendEvent({ type: "response.create" });

      setConnectionMode("webrtc");
      setIsConnected(true);
      toast.success("Voice connected! Start speaking.");
      return true;
    } catch (error) {
      console.error("[Voice] WebRTC failed:", error);
      // Clean up partial connection
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
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

      // Return false to signal fallback needed
      const errMsg = error instanceof Error ? error.message : "";
      if (errMsg === "ICE_BLOCKED" || errMsg.includes("Data channel")) {
        return false;
      }
      // Re-throw other errors
      throw error;
    }
  }, [memoryContext, onTranscript, disconnectWebRTC]);

  const connect = useCallback(async () => {
    setIsConnecting(true);

    try {
      // Try WebRTC first
      console.log("[Voice] Attempting WebRTC connection...");
      const webrtcSuccess = await connectWebRTC();

      if (!webrtcSuccess) {
        // Fallback to WebSocket relay
        console.log("[Voice] WebRTC failed, falling back to WebSocket relay...");
        toast.info("Using relay mode (your network may block direct connections)");
        await wsVoice.connect();
        setConnectionMode("websocket");
      }
    } catch (error) {
      console.error("[Voice] Connection error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to connect voice");
    } finally {
      setIsConnecting(false);
    }
  }, [connectWebRTC, wsVoice]);

  const disconnect = useCallback(() => {
    if (connectionMode === "websocket") {
      wsVoice.disconnect();
    } else {
      disconnectWebRTC();
    }
    setConnectionMode("idle");
  }, [connectionMode, wsVoice, disconnectWebRTC]);

  // Compute actual state based on active mode
  const actualIsConnected = connectionMode === "websocket" ? wsVoice.isConnected : isConnected;
  const actualIsSpeaking = connectionMode === "websocket" ? wsVoice.isSpeaking : isSpeaking;
  const actualIsConnecting = isConnecting || wsVoice.isConnecting;

  return (
    <div className="flex items-center gap-2">
      {!actualIsConnected ? (
        <Button
          variant="outline"
          size="sm"
          onClick={connect}
          disabled={actualIsConnecting}
          className="gap-2"
        >
          {actualIsConnecting ? (
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
            {connectionMode === "websocket" && (
              <span title="Relay mode">
                <Wifi className="h-3 w-3 text-muted-foreground" />
              </span>
            )}
            <VoiceWaveform isActive={true} isSpeaking={actualIsSpeaking} barCount={5} />
            <span className="text-xs text-muted-foreground">
              {actualIsSpeaking ? (
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
