import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { GeneratorForm } from "@/components/GeneratorForm";
import { OutputDisplay } from "@/components/OutputDisplay";
import { Playlist, PlaylistItem } from "@/components/Playlist";
import { AudioEditor } from "@/components/AudioEditor";
import { DownloadPanel } from "@/components/DownloadPanel";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Scissors, Download, Sparkles } from "lucide-react";

// Placeholder images for demo
const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=800&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  "https://images.unsplash.com/photo-1634017839464-5c339afa60f6?w=800&q=80",
];

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    imageUrl?: string;
    audioUrl?: string;
    prompt?: string;
  }>({});
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string>();
  const [selectedItem, setSelectedItem] = useState<PlaylistItem | null>(null);
  const [activeTab, setActiveTab] = useState("generator");

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    toast.info("Generating your creation...", {
      description: "This may take a moment",
    });

    // Simulate generation (replace with actual API call)
    setTimeout(() => {
      const newResult = {
        imageUrl: DEMO_IMAGES[Math.floor(Math.random() * DEMO_IMAGES.length)],
        audioUrl: "/demo-audio.mp3",
        prompt,
      };
      
      setResult(newResult);
      
      // Add to playlist
      const newItem: PlaylistItem = {
        id: Date.now().toString(),
        prompt,
        imageUrl: newResult.imageUrl,
        audioUrl: newResult.audioUrl,
        createdAt: new Date(),
        duration: "0:30",
      };
      setPlaylist((prev) => [newItem, ...prev]);
      
      setIsGenerating(false);
      toast.success("Creation complete!", {
        description: "Added to your playlist",
      });
    }, 3000);
  };

  const handlePlayItem = (item: PlaylistItem) => {
    if (currentlyPlaying === item.id) {
      setCurrentlyPlaying(undefined);
    } else {
      setCurrentlyPlaying(item.id);
      toast.info(`Now playing: "${item.prompt.slice(0, 30)}..."`);
    }
  };

  const handleDeleteItem = (id: string) => {
    setPlaylist((prev) => prev.filter((item) => item.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(undefined);
    }
    toast.success("Removed from playlist");
  };

  const handleSelectItem = (item: PlaylistItem) => {
    setSelectedItem(item);
    setResult({
      imageUrl: item.imageUrl,
      audioUrl: item.audioUrl,
      prompt: item.prompt,
    });
  };

  const handleSaveEdit = (startTime: number, endTime: number) => {
    if (selectedItem) {
      setPlaylist((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? { ...item, duration: `${Math.floor(endTime - startTime)}s` }
            : item
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        
        <section id="create" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Start <span className="gradient-text">Creating</span>
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Generate, edit, and manage your AI-powered music and visuals all in one place.
            </p>

            {/* Tabs for different sections */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-xl mx-auto grid-cols-4 mb-8">
                <TabsTrigger value="generator" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Generate</span>
                </TabsTrigger>
                <TabsTrigger value="playlist" className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  <span className="hidden sm:inline">Playlist</span>
                </TabsTrigger>
                <TabsTrigger value="editor" className="flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  <span className="hidden sm:inline">Editor</span>
                </TabsTrigger>
                <TabsTrigger value="download" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="generator" className="space-y-8">
                <GeneratorForm onGenerate={handleGenerate} isGenerating={isGenerating} />
                <OutputDisplay {...result} />
              </TabsContent>

              <TabsContent value="playlist">
                <div className="max-w-3xl mx-auto">
                  <Playlist
                    items={playlist}
                    onPlay={handlePlayItem}
                    onDelete={handleDeleteItem}
                    onSelect={handleSelectItem}
                    currentlyPlaying={currentlyPlaying}
                  />
                </div>
              </TabsContent>

              <TabsContent value="editor">
                <div className="max-w-3xl mx-auto">
                  <AudioEditor
                    audioUrl={selectedItem?.audioUrl || result.audioUrl}
                    imageUrl={selectedItem?.imageUrl || result.imageUrl}
                    prompt={selectedItem?.prompt || result.prompt}
                    onSave={handleSaveEdit}
                  />
                </div>
              </TabsContent>

              <TabsContent value="download">
                <div className="max-w-md mx-auto">
                  <DownloadPanel
                    imageUrl={selectedItem?.imageUrl || result.imageUrl}
                    audioUrl={selectedItem?.audioUrl || result.audioUrl}
                    prompt={selectedItem?.prompt || result.prompt}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
