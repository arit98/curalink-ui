import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Users, FlaskConical, BookOpen } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-accent/20 to-background">
          <div className="container py-20 md:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Connecting patients and researchers
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                  CuraLink connects patients and researchers to simplify access to clinical trials, experts, and publications.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="text-lg px-8"
                    onClick={() => navigate("/user?mode=register&role=0")}
                  >
                    I'm a Patient
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-lg px-8"
                    onClick={() => navigate("/user?mode=register&role=1")}
                  >
                    I'm a Researcher
                  </Button>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <img 
                  src={heroImage} 
                  alt="Healthcare Platform" 
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
              How CuraLink Helps
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FlaskConical className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Clinical Trials</h3>
                <p className="text-muted-foreground">
                  Discover relevant clinical trials matching your condition with AI-powered recommendations.
                </p>
              </div>

              <div className="bg-card rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Expert Network</h3>
                <p className="text-muted-foreground">
                  Connect with leading healthcare experts and specialists in your area of need.
                </p>
              </div>

              <div className="bg-card rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Research Publications</h3>
                <p className="text-muted-foreground">
                  Access the latest research publications and medical literature relevant to your condition.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
