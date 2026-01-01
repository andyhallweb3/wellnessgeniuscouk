import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseVoiceWebSocketOptions {
  memoryContext?: string;
  onTranscript?: (text: string, role: "user" | "assistant") => void;
}

export function useVoiceWebSocket({ memoryContext, onTranscript }: UseVoiceWebSocketOptions) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioQueueRef = useRef<Uint8Array[]>([]);
  const isPlayingRef = useRef(false);

  // Audio playback: decode PCM16 chunks and play them sequentially
  const playNextAudioChunk = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;

    isPlayingRef.current = true;
    const chunk = audioQueueRef.current.shift()!;

    try {
      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;

      // Convert PCM16 to Float32
      const int16 = new Int16Array(chunk.buffer, chunk.byteOffset, chunk.length / 2);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768;
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        isPlayingRef.current = false;
        playNextAudioChunk();
      };
      source.start();
    } catch (err) {
      console.error("[VoiceWS] Audio playback error:", err);
      isPlayingRef.current = false;
      playNextAudioChunk();
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);

    try {
      // Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Get auth token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.access_token) {
        throw new Error("Not authenticated. Please log in to use voice.");
      }

      // Build WebSocket URL with auth token and context
      const wsUrl = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/genie-voice-relay`);
      wsUrl.protocol = wsUrl.protocol.replace("https", "wss").replace("http", "ws");
      wsUrl.searchParams.set("token", sessionData.session.access_token);
      if (memoryContext) {
        wsUrl.searchParams.set("context", memoryContext);
      }

      console.log("[VoiceWS] Connecting to relay...");
      const ws = new WebSocket(wsUrl.toString());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[VoiceWS] Connected to relay");
        setIsConnected(true);
        setIsConnecting(false);
        toast.success("Voice connected (relay mode)! Start speaking.");

        // Set up audio capture and streaming
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

        processorRef.current.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;

          const inputData = e.inputBuffer.getChannelData(0);
          // Convert Float32 to PCM16
          const int16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          // Base64 encode
          const uint8 = new Uint8Array(int16.buffer);
          let binary = "";
          for (let i = 0; i < uint8.length; i++) {
            binary += String.fromCharCode(uint8[i]);
          }
          const base64Audio = btoa(binary);

          // Send to OpenAI via relay
          ws.send(JSON.stringify({
            type: "input_audio_buffer.append",
            audio: base64Audio,
          }));
        };

        sourceRef.current.connect(processorRef.current);
        processorRef.current.connect(audioContextRef.current.destination);

        // Send initial test message
        ws.send(JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [{ type: "input_text", text: "Confirm you can hear me. Say: connected." }],
          },
        }));
        ws.send(JSON.stringify({ type: "response.create" }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("[VoiceWS] Event:", data.type);

          if (data.type === "session.created" || data.type === "session.updated") {
            console.log("[VoiceWS] Session ready");
          } else if (data.type === "response.audio.delta") {
            setIsSpeaking(true);
            // Decode base64 audio and queue for playback
            if (data.delta) {
              const binary = atob(data.delta);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
              }
              audioQueueRef.current.push(bytes);
              playNextAudioChunk();
            }
          } else if (data.type === "response.audio_transcript.delta") {
            setIsSpeaking(true);
          } else if (data.type === "response.audio_transcript.done") {
            setIsSpeaking(false);
            if (onTranscript && data.transcript) {
              console.log("[VoiceWS] Assistant:", data.transcript);
              onTranscript(data.transcript, "assistant");
            }
          } else if (data.type === "conversation.item.input_audio_transcription.completed") {
            if (onTranscript && data.transcript) {
              console.log("[VoiceWS] User:", data.transcript);
              onTranscript(data.transcript, "user");
            }
          } else if (data.type === "response.done") {
            setIsSpeaking(false);
          } else if (data.type === "input_audio_buffer.speech_started") {
            console.log("[VoiceWS] User started speaking");
          } else if (data.type === "input_audio_buffer.speech_stopped") {
            console.log("[VoiceWS] User stopped speaking");
          } else if (data.type === "error") {
            console.error("[VoiceWS] Error:", data.error);
            toast.error("Voice error: " + (data.error?.message || "Unknown error"));
          }
        } catch (err) {
          console.error("[VoiceWS] Failed to parse message:", err);
        }
      };

      ws.onerror = (error) => {
        console.error("[VoiceWS] WebSocket error:", error);
        toast.error("Voice connection error");
      };

      ws.onclose = () => {
        console.log("[VoiceWS] WebSocket closed");
        setIsConnected(false);
        setIsSpeaking(false);
      };
    } catch (error) {
      console.error("[VoiceWS] Connection error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to connect voice");
      setIsConnecting(false);
    }
  }, [memoryContext, onTranscript, playNextAudioChunk]);

  const disconnect = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsConnected(false);
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnecting,
    isConnected,
    isSpeaking,
    connect,
    disconnect,
  };
}
