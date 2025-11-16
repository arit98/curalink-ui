import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Navigation, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import { patientService } from "@/services/patientService";
import axios from "axios";

const PatientOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Check if logged in
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/user");
    }
  }, [navigate]);

  // Get current location and reverse geocode
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = response.data;

          const locationString = data.address
            ? `${data.address.city || data.address.town || data.address.village || ""}, ${data.address.state || ""
              }, ${data.address.country || ""}`
              .replace(/^,\s*/, "")
              .replace(/,\s*,/g, ",")
              .trim()
            : data.display_name;

          setLocation(locationString);
          toast.success("Location updated!");
        } catch (error) {
          toast.error("Failed to fetch location details");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        toast.error("Unable to retrieve your location");
      }
    );
  };

  // Handle navigation logic
  const handleContinue = async () => {
    if (step === 1 && condition.trim()) {
      setStep(2);
      return;
    }

    if (step === 2) {
      try {
        setIsLoading(true);
        await patientService.saveProfile({ condition, location });
        toast.success("Your patient account has been successfully created!");
        navigate("/patient-dashboard");
      } catch (err: any) {
        console.error("Error saving patient profile:", err);
        toast.error(err.message || "Failed to complete onboarding");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-accent/10 to-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12">
            {/* Progress */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${step >= 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  1
                </div>
                <div
                  className={`h-1 w-16 ${step >= 2 ? "bg-primary" : "bg-muted"}`}
                />
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${step >= 2
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  2
                </div>
              </div>
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    Tell Us More
                  </h1>
                  <p className="text-muted-foreground">
                    Tell us about your medical condition
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="condition" className="text-base">
                    Describe your condition or symptoms
                  </Label>
                  <Textarea
                    id="condition"
                    placeholder="For example: I have stage 2 lung cancer and am looking for immunotherapy trials..."
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!condition.trim() || isLoading}
                  className="w-full"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    Almost there
                  </h1>
                  <p className="text-muted-foreground">
                    Help us personalize your experience
                  </p>
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
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isLocating}
                    size="icon"
                    className="h-10 w-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isLocating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                  </Button>
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
                    disabled={isLoading}
                    className="flex-1"
                    size="lg"
                  >
                    {isLoading ? "Saving..." : "Go to Dashboard"}
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

export default PatientOnboarding;
