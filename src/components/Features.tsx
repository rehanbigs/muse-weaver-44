import { Music, Image, Sparkles } from "lucide-react";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => {
  return (
    <div className="glass-card p-6 group hover:border-primary/30 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

export const Features = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          <span className="gradient-text">Dual Creation</span> Power
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          One prompt, two masterpieces. Our AI simultaneously generates stunning visuals and captivating audio.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={Music}
            title="AI Music Generation"
            description="Transform your ideas into unique musical compositions with our advanced audio synthesis model."
          />
          <FeatureCard
            icon={Image}
            title="Visual Artistry"
            description="Generate breathtaking images that perfectly complement your audio creation."
          />
          <FeatureCard
            icon={Sparkles}
            title="Synchronized Output"
            description="Both outputs are crafted to harmonize, creating a cohesive multimedia experience."
          />
        </div>
      </div>
    </section>
  );
};
