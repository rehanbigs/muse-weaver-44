import { useState, useRef, useEffect } from "react";
import { 
  Scissors, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  ZoomIn, 
  ZoomOut,
  SkipBack,
  SkipForward,
  Loader2
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
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  // Refs for Web Audio API
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- 1. Load and Decode Audio ---
  useEffect(() => {
    if (!audioUrl) return;

    const loadAudio = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        // Create Audio Context if not exists
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const decodedBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        setAudioBuffer(decodedBuffer);
        setDuration(decodedBuffer.duration);
        setTrimEnd(decodedBuffer.duration); // Default trim end is full length
        setCurrentTime(0);
        
        // Draw the waveform immediately
        drawWaveform(decodedBuffer);
      } catch (error) {
        console.error("Error loading audio:", error);
        toast.error("Failed to load audio for editing");
      } finally {
        setIsLoading(false);
      }
    };

    loadAudio();

    // Cleanup
    return () => {
      stopPlayback();
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, [audioUrl]);

  // --- 2. Draw Waveform on Canvas ---
  const drawWaveform = (buffer: AudioBuffer) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const data = buffer.getChannelData(0); // Use left channel
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(124, 58, 237, 0.5)"; // Primary Color (Purple-ish)
    
    // Draw bars
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
  };

  // --- 3. Playback Logic ---
  const playAudio = () => {
    if (!audioContextRef.current || !audioBuffer) return;

    // If context is suspended (browser policy), resume it
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);

    // Start playing from currentTime (or trimStart if we are outside region)
    let startOffset = currentTime;
    if (startOffset >= trimEnd || startOffset < trimStart) {
      startOffset = trimStart;
    }

    source.start(0, startOffset);
    sourceNodeRef.current = source;
    startTimeRef.current = audioContextRef.current.currentTime - startOffset;
    
    setIsPlaying(true);
    requestAnimationFrame(updateProgress);

    source.onended = () => {
      setIsPlaying(false);
    };
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const updateProgress = () => {
    if (!audioContextRef.current || !isPlaying) return;
    
    const now = audioContextRef.current.currentTime - startTimeRef.current;
    
    if (now >= trimEnd) {
      stopPlayback();
      setCurrentTime(trimStart); // Loop back to start
    } else {
      setCurrentTime(now);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playAudio();
    }
  };

  // --- 4. Export (Cut & Download) Logic ---
  const handleDownloadTrimmed = async () => {
    if (!audioBuffer) return;

    const sampleRate = audioBuffer.sampleRate;
    const startFrame = Math.floor(trimStart * sampleRate);
    const endFrame = Math.floor(trimEnd * sampleRate);
    const frameCount = endFrame - startFrame;

    // Create a new buffer for the trimmed audio
    const newBuffer = new AudioContext().createBuffer(
      audioBuffer.numberOfChannels,
      frameCount,
      sampleRate
    );

    // Copy data
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      const channelData = audioBuffer.getChannelData(i);
      const newChannelData = newBuffer.getChannelData(i);
      for (let j = 0; j < frameCount; j++) {
        newChannelData[j] = channelData[startFrame + j];
      }
    }

    // Convert AudioBuffer to WAV blob
    const wavBlob = await bufferToWave(newBuffer, frameCount);
    const url = URL.createObjectURL(wavBlob);
    
    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `trimmed-audio-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Trimmed audio downloaded!");
  };

  // Helper: Convert AudioBuffer to WAV
  const bufferToWave = (abuffer: AudioBuffer, len: number) => {
    let numOfChan = abuffer.numberOfChannels,
        length = len * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [], i, sample,
        offset = 0,
        pos = 0;

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded in this example)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // write interleaved data
    for(i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    while(pos < len) {
      for(i = 0; i < numOfChan; i++) {             // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
        view.setInt16(44 + offset, sample, true);          // write 16-bit sample
        offset += 2;
      }
      pos++;
    }

    return new Blob([buffer], {type: "audio/wav"});

    function setUint16(data: any) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: any) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }

  // --- UI Helpers ---
  const formatTime = (seconds: number) => {
    if (!seconds && seconds !== 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSkip = (direction: "back" | "forward") => {
    const skipAmount = 5;
    setCurrentTime((prev) => {
      const newVal = direction === "back" ? prev - skipAmount : prev + skipAmount;
      return Math.max(0, Math.min(duration, newVal));
    });
  };

  if (!audioUrl && !imageUrl) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <Scissors className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No clip to edit</h3>
        <p className="text-muted-foreground text-sm">
          Go to your Playlist and click an item to edit it here.
        </p>
      </div>
    );
  }

  const trimStartPercent = duration > 0 ? (trimStart / duration) * 100 : 0;
  const trimEndPercent = duration > 0 ? (trimEnd / duration) * 100 : 100;
  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="glass-card p-6 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary" />
          Audio Editor
        </h3>
        
        {/* Zoom controls (Visual only for this version) */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {prompt && (
        <p className="text-sm text-muted-foreground mb-4 italic line-clamp-1">Editing: "{prompt}"</p>
      )}

      {/* --- Visualizer Area --- */}
      <div className="relative mb-6 h-32 bg-muted/20 rounded-lg overflow-hidden border border-border/50">
        
        {/* The Waveform Canvas */}
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={128} 
          className="w-full h-full absolute inset-0 z-0 opacity-80"
        />

        {/* Trim Regions (Darken areas outside selection) */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Left Dim */}
          <div className="absolute top-0 bottom-0 left-0 bg-background/60 backdrop-blur-[1px] border-r-2 border-primary"
               style={{ width: `${trimStartPercent}%` }} />
          {/* Right Dim */}
          <div className="absolute top-0 bottom-0 right-0 bg-background/60 backdrop-blur-[1px] border-l-2 border-primary"
               style={{ width: `${100 - trimEndPercent}%` }} />
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 shadow-[0_0_10px_rgba(255,0,0,0.5)] transition-all duration-75"
          style={{ left: `${currentPercent}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
        </div>
      </div>

      {/* --- Sliders --- */}
      <div className="space-y-4 mb-6 px-2">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground w-20">Start</span>
          <Slider
            value={[trimStart]}
            min={0}
            max={duration}
            step={0.1}
            onValueChange={([val]) => {
              if (val < trimEnd - 0.5) {
                setTrimStart(val);
                setCurrentTime(val); // Jump to start
              }
            }}
            className="flex-1"
          />
          <span className="text-sm font-mono w-16 text-right">{formatTime(trimStart)}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground w-20">End</span>
          <Slider
            value={[trimEnd]}
            min={0}
            max={duration}
            step={0.1}
            onValueChange={([val]) => {
              if (val > trimStart + 0.5) setTrimEnd(val);
            }}
            className="flex-1"
          />
          <span className="text-sm font-mono w-16 text-right">{formatTime(trimEnd)}</span>
        </div>
      </div>

      {/* --- Controls --- */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => handleSkip("back")}>
          <SkipBack className="w-5 h-5" />
        </Button>
        
        <Button
          variant="default" // Using default primary color
          size="icon"
          className="w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-transform"
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 ml-1 fill-current" />
          )}
        </Button>
        
        <Button variant="ghost" size="icon" onClick={() => handleSkip("forward")}>
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      {/* --- Footer Stats & Actions --- */}
      <div className="flex justify-between text-sm text-muted-foreground mb-6 px-4 bg-muted/20 py-2 rounded-full">
        <span>Current: {formatTime(currentTime)}</span>
        <span className="text-foreground font-medium">Duration: {formatTime(trimEnd - trimStart)}</span>
        <span>Total: {formatTime(duration)}</span>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => {
          setTrimStart(0);
          setTrimEnd(duration);
        }}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        
        <Button variant="default" className="flex-[2]" onClick={handleDownloadTrimmed}>
          <Download className="w-4 h-4 mr-2" />
          Download Trimmed Clip
        </Button>
      </div>
    </div>
  );
};