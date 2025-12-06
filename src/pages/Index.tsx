import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { GeneratorForm } from "@/components/GeneratorForm";
import { OutputDisplay } from "@/components/OutputDisplay";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

// Placeholder image for demo
const DEMO_IMAGE = "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=800&q=80";

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    imageUrl?: string;
    audioUrl?: string;
    prompt?: string;
  }>({});

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    toast.info("Generating your creation...", {
      description: "This may take a moment",
    });

    // Simulate generation (replace with actual API call)
    setTimeout(() => {
      setResult({
        imageUrl: DEMO_IMAGE,
        audioUrl: "/demo-audio.mp3",
        prompt,
      });
      setIsGenerating(false);
      toast.success("Creation complete!", {
        description: "Your music and image are ready",
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        
        <section id="create" className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Start <span className="gradient-text">Creating</span>
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Enter a description of what you want to create and let our AI do the rest.
            </p>
            
            <GeneratorForm onGenerate={handleGenerate} isGenerating={isGenerating} />
            <OutputDisplay {...result} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
