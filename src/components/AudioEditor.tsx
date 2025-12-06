import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Scissors, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  ZoomIn, 
  ZoomOut,
  SkipBack,
  SkipForward
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface AudioEditorProps {
  audioUrl?: string;
  imageUrl?: string;
  prompt?: string;
  onSave?: (startTime: number, endTime: number) => void;
}

export const AudioEditor = ({ audioUrl, imageUrl, prompt, onSave }: AudioEditorProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30); // Default duration for demo
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);
  const [zoom, setZoom] = useState(1);
  const waveformRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Generate waveform bars
  const waveformBars = Array.from({ length: 100 }, (_, i) => ({
    height: Math.random() * 0.8 + 0.2,
    id: i,
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      setIsPlaying(true);
      const animate = () => {
        setCurrentTime((prev) => {
          if (prev >= trimEnd) {
            setIsPlaying(false);
            return trimStart;
          }
          return prev + 0.05;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    }
  };

  const handleReset = () => {
    setTrimStart(0);
    setTrimEnd(duration);
    setCurrentTime(0);
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleCut = () => {
    if (trimEnd - trimStart < 1) {
      toast.error("Selection too short", {
        description: "Please select at least 1 second",
      });
      return;
    }
    
    toast.success("Clip trimmed!", {
      description: `New duration: ${formatTime(trimEnd - trimStart)}`,
    });
    
    if (onSave) {
      onSave(trimStart, trimEnd);
    }
  };

  const handleDownload = () => {
    // In a real app, this would process and download the trimmed audio
    toast.success("Download started!", {
      description: "Your trimmed clip is being prepared",
    });
  };

  const handleSkip = (direction: "back" | "forward") => {
    const skipAmount = 5;
    setCurrentTime((prev) => {
      if (direction === "back") {
        return Math.max(trimStart, prev - skipAmount);
      }
      return Math.min(trimEnd, prev + skipAmount);
    });
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (!audioUrl && !imageUrl) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <Scissors className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No clip to edit</h3>
        <p className="text-muted-foreground text-sm">
          Generate or select a clip from your playlist to start editing
        </p>
      </div>
    );
  }

  const trimStartPercent = (trimStart / duration) * 100;
  const trimEndPercent = (trimEnd / duration) * 100;
  const currentPercent = (currentTime / duration) * 100;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary" />
          Audio Editor
        </h3>
        
        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Prompt display */}
      {prompt && (
        <p className="text-sm text-muted-foreground mb-4 italic">"{prompt}"</p>
      )}

      {/* Waveform visualization */}
      <div className="relative mb-6" ref={waveformRef}>
        {/* Trim region highlight */}
        <div
          className="absolute top-0 bottom-0 bg-primary/20 border-x-2 border-primary rounded"
          style={{
            left: `${trimStartPercent}%`,
            width: `${trimEndPercent - trimStartPercent}%`,
          }}
        />

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-secondary z-10 transition-all duration-75"
          style={{ left: `${currentPercent}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-secondary rounded-full" />
        </div>

        {/* Waveform bars */}
        <div 
          className="flex items-center justify-center gap-[2px] h-24 px-2 bg-muted/30 rounded-lg overflow-hidden"
          style={{ transform: `scaleX(${zoom})`, transformOrigin: "left" }}
        >
          {waveformBars.map((bar) => {
            const barPosition = (bar.id / waveformBars.length) * 100;
            const isInTrimRegion = barPosition >= trimStartPercent && barPosition <= trimEndPercent;
            const isBeforeCurrent = barPosition <= currentPercent;
            
            return (
              <div
                key={bar.id}
                className={`w-1 rounded-full transition-colors ${
                  isInTrimRegion
                    ? isBeforeCurrent
                      ? "bg-primary"
                      : "bg-primary/50"
                    : "bg-muted-foreground/30"
                }`}
                style={{ height: `${bar.height * 100}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Trim sliders */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground w-20">Trim Start</span>
          <Slider
            value={[trimStart]}
            min={0}
            max={duration - 1}
            step={0.1}
            onValueChange={([value]) => {
              if (value < trimEnd - 1) {
                setTrimStart(value);
                if (currentTime < value) setCurrentTime(value);
              }
            }}
            className="flex-1"
          />
          <span className="text-sm font-mono w-12">{formatTime(trimStart)}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground w-20">Trim End</span>
          <Slider
            value={[trimEnd]}
            min={1}
            max={duration}
            step={0.1}
            onValueChange={([value]) => {
              if (value > trimStart + 1) {
                setTrimEnd(value);
                if (currentTime > value) setCurrentTime(value);
              }
            }}
            className="flex-1"
          />
          <span className="text-sm font-mono w-12">{formatTime(trimEnd)}</span>
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => handleSkip("back")}>
          <SkipBack className="w-5 h-5" />
        </Button>
        
        <Button
          variant="hero"
          size="icon"
          className="w-12 h-12 rounded-full"
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>
        
        <Button variant="ghost" size="icon" onClick={() => handleSkip("forward")}>
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      {/* Time display */}
      <div className="flex justify-between text-sm text-muted-foreground mb-6">
        <span>{formatTime(currentTime)}</span>
        <span className="text-foreground font-medium">
          Selection: {formatTime(trimEnd - trimStart)}
        </span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button variant="glass" className="flex-1" onClick={handleCut}>
          <Scissors className="w-4 h-4 mr-2" />
          Cut Clip
        </Button>
        <Button variant="hero" className="flex-1" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
};
