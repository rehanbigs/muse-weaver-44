import { Play, Pause, Download, Volume2, VolumeX, Maximize2, Repeat } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

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
  const [isHovering, setIsHovering] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Audio Logic ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.volume = volume;

      const setAudioData = () => {
        setDuration(audio.duration);
      };

      const setAudioTime = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      // Events
      audio.addEventListener("loadedmetadata", setAudioData);
      audio.addEventListener("timeupdate", setAudioTime);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("loadedmetadata", setAudioData);
        audio.removeEventListener("timeupdate", setAudioTime);
        audio.removeEventListener("ended", handleEnded);
        audio.pause();
      };
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const time = value[0];
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const vol = value[0];
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
    toast.success(`Downloaded ${type} successfully`);
  };

  if (!imageUrl && !audioUrl) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 animate-fade-in px-4">
      {/* Main Player Card */}
      <div 
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl transition-all duration-500"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Dynamic Background Glow based on Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="background" 
              className="w-full h-full object-cover opacity-30 blur-3xl scale-110"
            />
          )}
        </div>

        <div className="relative z-20 p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-end">
          
          {/* --- Album Art (Left) --- */}
          <div className="relative group shrink-0">
            <div className={`relative w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-2xl border border-white/10 transition-transform duration-700 ${isPlaying ? 'scale-[1.02]' : 'scale-100'}`}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Album Art"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-900/20 animate-pulse" />
              )}
              
              {/* Overlay Download Button for Image */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full bg-black/50 border-white/20 text-white hover:bg-white hover:text-black transition-all"
                  onClick={() => handleDownload(imageUrl, 'image')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save Art
                </Button>
              </div>
            </div>
          </div>

          {/* --- Controls & Metadata (Right) --- */}
          <div className="flex-1 w-full flex flex-col gap-6">
            
            {/* Metadata */}
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/20 mb-2">
                New Generation
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight line-clamp-1" title={prompt}>
                {prompt || "Untitled Track"}
              </h2>
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                AI Generated • {new Date().getFullYear()}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 w-full">
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls Row */}
            <div className="flex items-center justify-between">
              
              {/* Left Side: Volume */}
              <div className="hidden md:flex items-center gap-3 w-32 group">
                <button 
                  onClick={toggleMute} 
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-20 transition-opacity opacity-50 group-hover:opacity-100"
                />
              </div>

              {/* Center: Main Controls */}
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hidden sm:flex">
                  <Repeat className="w-5 h-5" />
                </Button>

                <Button
                  size="icon"
                  className="w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 hover:bg-primary/90 transition-all duration-300 flex items-center justify-center"
                  onClick={togglePlay}
                  disabled={!audioUrl}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 ml-1 fill-current" />
                  )}
                </Button>

                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hidden sm:flex">
                  <Maximize2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Right Side: Actions */}
              <div className="flex items-center gap-2 w-32 justify-end">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-muted-foreground hover:text-white hover:bg-white/10 rounded-full"
                  onClick={() => handleDownload(audioUrl, 'audio')}
                  title="Download Audio"
                >
                  <Download className="w-5 h-5" />
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};