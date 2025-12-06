import { Play, Pause, Download, Volume2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface OutputDisplayProps {
  imageUrl?: string;
  audioUrl?: string;
  prompt?: string;
}

export const OutputDisplay = ({ imageUrl, audioUrl, prompt }: OutputDisplayProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!imageUrl && !audioUrl) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <div className="glass-card p-6 md:p-8">
        {prompt && (
          <p className="text-sm text-muted-foreground mb-6 italic">"{prompt}"</p>
        )}
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Output */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Generated Image</h3>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted/30 border border-border/50">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="AI Generated"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* Audio Output */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Generated Music</h3>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 border border-border/50 flex flex-col items-center justify-center p-6">
              {/* Waveform visualization placeholder */}
              <div className="flex items-end gap-1 h-24 mb-8">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 bg-gradient-to-t from-primary to-secondary rounded-full transition-all duration-300 ${
                      isPlaying ? "animate-pulse" : ""
                    }`}
                    style={{
                      height: `${Math.random() * 60 + 20}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
              
              {/* Play controls */}
              <div className="flex items-center gap-4">
                <Button
                  variant="hero"
                  size="icon"
                  className="w-14 h-14 rounded-full"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </Button>
              </div>
              
              {/* Volume */}
              <div className="flex items-center gap-2 mt-6 text-muted-foreground">
                <Volume2 className="w-4 h-4" />
                <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-gradient-to-r from-primary to-secondary rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
