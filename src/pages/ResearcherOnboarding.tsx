import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, X } from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "react-toastify";

const ResearcherOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Start at step 1 now (no auth step)
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Check authentication on component mount
  // useEffect(() => {
  //   if (!authService.isAuthenticated()) {
  //     navigate("/user"); // Redirect to User page if not authenticated
  //   }
  // }, [navigate]);

  const diseaseTags = [
    "Lung Cancer",
    "Glioma",
    "Breast Cancer",
    "Diabetes",
    "Alzheimer's",
    "Parkinson's",
    "Heart Disease",
    "Kidney Disease",
  ];

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleContinue = () => {
    if (step === 1 && condition) {
      setStep(2);
    } else if (step === 2) {
      navigate("/");
      toast.success("Your researcher account has been successfully created");
      localStorage.clear();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-accent/10 to-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  1
                </div>
                <div className={`h-1 w-16 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  2
                </div>
              </div>
            </div>

            {/* Step 1: Research Area */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">Tell Us More</h1>
                  <p className="text-muted-foreground">Tell us about your research area and study</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="condition" className="text-base">
                    Describe your research interests
                  </Label>
                  <Textarea
                    id="condition"
                    placeholder="For example: I have done research on cancer immunotherapy"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!condition}
                  className="w-full"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Step 2: Location & Tags */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">Almost there</h1>
                  <p className="text-muted-foreground">Help us personalize your experience</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="location" className="text-base">
                    Your location (optional)
                  </Label>
                  <Input
                    id="location"
                    placeholder="Enter your city or country"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base">
                    Related conditions (optional)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {diseaseTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer text-sm py-2 px-3"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                        {selectedTags.includes(tag) && (
                          <X className="ml-1 h-3 w-3" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="w-1/3"
                    size="lg"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleContinue}
                    className="flex-1"
                    size="lg"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResearcherOnboarding;
