import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface VoiceWaveformProps {
  isActive: boolean;
  isSpeaking?: boolean;
  className?: string;
  barCount?: number;
}

export default function VoiceWaveform({
  isActive,
  isSpeaking = false,
  className,
  barCount = 5,
}: VoiceWaveformProps) {
  const [heights, setHeights] = useState<number[]>(() => Array(barCount).fill(20));
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setHeights(Array(barCount).fill(20));
      return;
    }

    const animate = () => {
      setHeights((prev) =>
        prev.map(() => {
          if (isSpeaking) {
            // More dynamic animation when speaking
            return Math.random() * 80 + 20;
          } else {
            // Subtle listening animation
            return Math.random() * 40 + 15;
          }
        })
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    // Slower animation rate for smoother visuals
    const interval = setInterval(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(animate);
    }, isSpeaking ? 80 : 150);

    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, isSpeaking, barCount]);

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-0.5 h-6",
        className
      )}
    >
      {heights.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-1 rounded-full transition-all duration-100",
            isSpeaking ? "bg-accent" : "bg-green-500",
            !isActive && "bg-muted-foreground/30"
          )}
          style={{
            height: `${height}%`,
            transitionDuration: isSpeaking ? "80ms" : "150ms",
          }}
        />
      ))}
    </div>
  );
}
