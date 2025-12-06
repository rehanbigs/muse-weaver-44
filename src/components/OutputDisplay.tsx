import { Play, Pause, Download, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"; // If you don't have this, standard input is used below

interface OutputDisplayProps {
  imageUrl?: string;
  audioUrl?: string;
  prompt?: string;
}

export const OutputDisplay = ({ imageUrl, audioUrl, prompt }: OutputDisplayProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio Logic
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Event Listeners
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });
      
      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      audio.volume = volume;

      return () => {
        audio.pause();
        audio.remove();
      };
    }
  }, [audioUrl]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle Seeking (Scrubbing)
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Handle Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    audioRef.current.volume = vol;
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Format time helper (e.g., 125s -> "2:05")
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleDownload = (url: string | undefined, type: 'image' | 'audio') => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `muse-weaver-${type}-${Date.now()}.${type === 'image' ? 'jpg' : 'wav'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!imageUrl && !audioUrl) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 animate-fade-in">
      <div className="glass-card p-6 md:p-8">
        {prompt && (
          <p className="text-sm text-muted-foreground mb-6 italic border-l-2 border-primary pl-3">
            "{prompt}"
          </p>
        )}
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* --- LEFT: Image Output --- */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Visual Art</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDownload(imageUrl, 'image')}
                className="hover:bg-primary/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Save Image
              </Button>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted/30 border border-border/50 shadow-inner group">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="AI Generated"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* --- RIGHT: Music Player --- */}
          <div className="flex flex-col h-full justify-between space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Audio Track</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDownload(audioUrl, 'audio')}
                disabled={!audioUrl}
                className="hover:bg-primary/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Save Audio
              </Button>
            </div>

            {/* Visualizer Container */}
            <div className="relative flex-1 min-h-[200px] rounded-xl overflow-hidden bg-gradient-to-br from-background to-secondary/10 border border-border/50 flex flex-col items-center justify-center p-6 shadow-sm">
              
              {/* Animated Bars */}
              <div className="flex items-end gap-1.5 h-24 mb-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-gradient-to-t from-primary to-purple-500 rounded-full transition-all duration-300"
                    style={{
                      height: isPlaying 
                        ? `${Math.random() * 80 + 20}%` 
                        : "20%",
                      opacity: isPlaying ? 1 : 0.5,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>

              {/* Player Controls */}
              <div className="w-full space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Row */}
                <div className="flex items-center justify-between gap-4 mt-2">
                  
                  {/* Play Button */}
                  <Button
                    variant="default"
                    size="icon"
                    className="w-12 h-12 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    onClick={togglePlay}
                    disabled={!audioUrl}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 ml-1 fill-current" />
                    )}
                  </Button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2 group bg-secondary/30 p-2 rounded-full px-4">
                    <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground">
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-muted-foreground/30 rounded-lg appearance-none cursor-pointer accent-foreground"
                    />
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};