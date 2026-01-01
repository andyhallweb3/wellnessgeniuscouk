import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import demoVideo from "@/assets/ai-advisor-demo.mp4";

const DemoVideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <section className="section-padding bg-card/50">
      <div className="container-wide">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            See It In Action
          </p>
          <h2 className="text-2xl lg:text-3xl tracking-tight mb-3">
            From question to answer in 60 seconds
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Watch how wellness operators use the AI Advisor to get strategic insights instantly.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl bg-background">
            {/* Video */}
            <video
              ref={videoRef}
              src={demoVideo}
              className="w-full aspect-video object-cover"
              muted={isMuted}
              playsInline
              loop={false}
              onEnded={handleVideoEnd}
              onClick={togglePlay}
            />

            {/* Play overlay (shows when paused) */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm cursor-pointer transition-opacity"
                onClick={togglePlay}
              >
                <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center shadow-glow hover:scale-105 transition-transform">
                  <Play size={32} className="text-accent-foreground ml-1" fill="currentColor" />
                </div>
              </div>
            )}

            {/* Controls bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
              <div className="flex items-center justify-between">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                >
                  {isPlaying ? (
                    <Pause size={20} className="text-foreground" />
                  ) : (
                    <Play size={20} className="text-foreground" />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">30 sec demo</span>
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX size={18} className="text-foreground" />
                    ) : (
                      <Volume2 size={18} className="text-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Caption */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Real interface. Real insights. No scripted demo.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DemoVideoSection;