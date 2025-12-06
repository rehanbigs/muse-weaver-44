import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Music, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GeneratorFormProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

export const GeneratorForm = ({ onGenerate, isGenerating }: GeneratorFormProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="glass-card p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Music className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Music</span>
          </div>
          <span className="text-muted-foreground">+</span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
            <ImageIcon className="w-4 h-4 text-secondary" />
            <span className="text-xs font-medium text-secondary">Image</span>
          </div>
        </div>
        
        <Textarea
          placeholder="Describe your vision... e.g., 'A peaceful sunset over ocean waves with soft piano melodies'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mb-4 min-h-[100px]"
          disabled={isGenerating}
        />
        
        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="w-full"
          disabled={!prompt.trim() || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating Magic...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
