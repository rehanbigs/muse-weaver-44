import { Download, FileAudio, FileImage, Package, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface DownloadPanelProps {
  imageUrl?: string;
  audioUrl?: string;
  prompt?: string;
}

type FormatOption = {
  id: string;
  label: string;
  extension: string;
  icon: React.ElementType;
  type: "audio" | "image";
};

const formatOptions: FormatOption[] = [
  { id: "mp3", label: "MP3 Audio", extension: ".mp3", icon: FileAudio, type: "audio" },
  { id: "wav", label: "WAV Audio (Lossless)", extension: ".wav", icon: FileAudio, type: "audio" },
  { id: "png", label: "PNG Image", extension: ".png", icon: FileImage, type: "image" },
  { id: "jpg", label: "JPG Image (Compressed)", extension: ".jpg", icon: FileImage, type: "image" },
];

export const DownloadPanel = ({ imageUrl, audioUrl, prompt }: DownloadPanelProps) => {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["mp3", "png"]);
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleFormat = (formatId: string) => {
    setSelectedFormats((prev) =>
      prev.includes(formatId)
        ? prev.filter((id) => id !== formatId)
        : [...prev, formatId]
    );
  };

  const handleDownload = async (type: "all" | "audio" | "image") => {
    const formatsToDownload = selectedFormats.filter((id) => {
      const format = formatOptions.find((f) => f.id === id);
      if (type === "all") return true;
      return format?.type === type;
    });

    if (formatsToDownload.length === 0) {
      toast.error("No formats selected", {
        description: "Please select at least one format to download",
      });
      return;
    }

    setIsDownloading(true);
    
    // Simulate download processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast.success("Download complete!", {
      description: `Downloaded ${formatsToDownload.length} file(s)`,
    });
    
    setIsDownloading(false);
  };

  const hasContent = imageUrl || audioUrl;

  if (!hasContent) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <Download className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nothing to download</h3>
        <p className="text-muted-foreground text-sm">
          Generate content first to download it
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
        <Download className="w-5 h-5 text-primary" />
        Download Options
      </h3>

      {prompt && (
        <p className="text-sm text-muted-foreground mb-4 italic">"{prompt}"</p>
      )}

      {/* Format selection */}
      <div className="space-y-3 mb-6">
        {formatOptions.map((format) => {
          const isDisabled =
            (format.type === "audio" && !audioUrl) ||
            (format.type === "image" && !imageUrl);
          const isSelected = selectedFormats.includes(format.id);
          const Icon = format.icon;

          return (
            <label
              key={format.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                isDisabled
                  ? "opacity-50 cursor-not-allowed border-border/30 bg-muted/10"
                  : isSelected
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/50 hover:border-border hover:bg-muted/20"
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => !isDisabled && toggleFormat(format.id)}
                disabled={isDisabled}
              />
              <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              <span className="flex-1 text-sm font-medium">{format.label}</span>
              <span className="text-xs text-muted-foreground">{format.extension}</span>
            </label>
          );
        })}
      </div>

      {/* Download buttons */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          onClick={() => handleDownload("audio")}
          disabled={!audioUrl || isDownloading}
          className="flex-col h-auto py-3"
        >
          <FileAudio className="w-5 h-5 mb-1" />
          <span className="text-xs">Audio Only</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleDownload("image")}
          disabled={!imageUrl || isDownloading}
          className="flex-col h-auto py-3"
        >
          <FileImage className="w-5 h-5 mb-1" />
          <span className="text-xs">Image Only</span>
        </Button>
        
        <Button
          variant="hero"
          onClick={() => handleDownload("all")}
          disabled={isDownloading}
          className="flex-col h-auto py-3"
        >
          {isDownloading ? (
            <div className="w-5 h-5 mb-1 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Package className="w-5 h-5 mb-1" />
          )}
          <span className="text-xs">Download All</span>
        </Button>
      </div>

      {/* Selected count */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        {selectedFormats.length} format(s) selected
      </p>
    </div>
  );
};
