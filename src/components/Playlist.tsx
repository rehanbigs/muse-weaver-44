import { Play, Pause, Trash2, Music, Image, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface PlaylistItem {
  id: string;
  prompt: string;
  imageUrl?: string;
  audioUrl?: string;
  createdAt: Date;
  duration?: string;
}

interface PlaylistProps {
  items: PlaylistItem[];
  onPlay: (item: PlaylistItem) => void;
  onDelete: (id: string) => void;
  onSelect: (item: PlaylistItem) => void;
  currentlyPlaying?: string;
}

export const Playlist = ({ items, onPlay, onDelete, onSelect, currentlyPlaying }: PlaylistProps) => {
  if (items.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <Music className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No creations yet</h3>
        <p className="text-muted-foreground text-sm">
          Generate some music and images to build your playlist
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          Your Playlist
          <span className="text-sm text-muted-foreground font-normal">({items.length} items)</span>
        </h3>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="divide-y divide-border/30">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-4 hover:bg-muted/30 transition-colors cursor-pointer group ${
                currentlyPlaying === item.id ? "bg-primary/10" : ""
              }`}
              onClick={() => onSelect(item)}
            >
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Play overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlay(item);
                    }}
                    className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {currentlyPlaying === item.id ? (
                      <Pause className="w-6 h-6 text-primary" />
                    ) : (
                      <Play className="w-6 h-6 text-primary ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.prompt}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.duration || "0:30"}
                    </span>
                    <span>
                      {item.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
