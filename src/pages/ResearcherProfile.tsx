import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, MapPin, Camera, Edit2, Navigation, Loader2, GraduationCap, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/apiConfig";
import { researcherService } from "@/services/researcherService";
import { authService } from "@/services/authService";

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

type ProfilePersonal = {
  firstName: string;
  email: string;
  password: string;
  role: string;
};

type ProfileDetails = {
  condition: string;
  location: string;
  avatar: string;
};

type ProfileState = {
  personal: ProfilePersonal;
  details: ProfileDetails;
};

const getResearcherRole = (roleValue: any): string => {
  if (roleValue === "researcher" || roleValue === "caregiver" || roleValue === 1 || roleValue === "1") {
    return "researcher";
  }
  return "researcher";
};

export const ResearcherProfile = () => {
  const userId = localStorage.getItem("userId");
  const roleFromStorage = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const [isEditingAuth, setIsEditingAuth] = useState(false);
  const [isEditingOnboarding, setIsEditingOnboarding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [profile, setProfile] = useState<ProfileState>({
    personal: {
      firstName: localStorage.getItem("username") || "",
      email: "",
      password: "",
      role: "researcher",
    },
    details: {
      condition: "",
      location: "",
      avatar: "",
    },
  });

  const API_URL = getApiBaseUrl();

  const isResearcher = useMemo(() => {
    return roleFromStorage === "1" || roleFromStorage === "researcher" || Number(roleFromStorage) === 1;
  }, [roleFromStorage]);

  const handleSaveAuth = async () => {
    if (!isResearcher) {
      toast({ title: "Only researcher accounts can update this profile", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);

      if (userId) {
        try {
          // Prepare update payload
          const updatePayload: any = {
            name: profile.personal.firstName,
            email: profile.personal.email,
          };

          // Only include password if it's not empty
          if (profile.personal.password && profile.personal.password.trim()) {
            updatePayload.password = profile.personal.password;
          }

          // Convert role to number (1 for researcher)
          if (profile.personal.role === "researcher" || profile.personal.role === "1") {
            updatePayload.role = 1;
          } else {
            updatePayload.role = Number(profile.personal.role) || 1;
          }

          await authService.updateUser(userId, updatePayload);
          setIsEditingAuth(false);
          toast({ title: "Account details updated successfully!" });
          await fetchUserProfile();
        } catch (updateError: any) {
          const statusCode = updateError?.response?.status ?? updateError?.status;
          if (statusCode !== 405) {
            throw updateError;
          }
          console.warn(
            "Account details update not supported on this backend.",
            updateError
          );
          toast({ title: "Account details update not supported", variant: "destructive" });
        }
      }
    } catch (error: any) {
      console.error("Failed to save account details:", error);
      toast({
        title: error.response?.data?.detail || error.message || "Failed to update account details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOnboarding = async () => {
    if (!isResearcher) {
      toast({ title: "Only researcher accounts can update this profile", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);

      const updateData: { condition: string; location?: string } = {
        condition: profile.details.condition || "",
      };

      if (profile.details.location && profile.details.location.trim()) {
        updateData.location = profile.details.location.trim();
      }
      
      await researcherService.updateProfile(updateData);

      setIsEditingOnboarding(false);
      toast({ title: "Research profile updated successfully!" });
      await fetchUserProfile();
    } catch (error: any) {
      console.error("Failed to save researcher profile:", error);
      toast({
        title: error.response?.data?.detail || error.message || "Failed to update researcher profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAuth = () => {
    setIsEditingAuth(true);
  };

  const handleEditOnboarding = () => {
    setIsEditingOnboarding(true);
    setLocationSearch(profile.details.location);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation is not supported by your browser", variant: "destructive" });
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
            ? `${data.address.city || data.address.town || data.address.village || ""}, ${data.address.state || ""}, ${data.address.country || ""}`
                .replace(/^,\s*/, "")
                .replace(/,\s*,/g, ",")
                .trim()
            : data.display_name;

          setProfile((prev) => ({
            ...prev,
            details: {
              ...prev.details,
              location: locationString,
            },
          }));
          setLocationSearch(locationString);
          toast({ title: "Location updated!" });
        } catch (error) {
          toast({ title: "Failed to get location details", variant: "destructive" });
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        toast({ title: "Unable to retrieve your location", variant: "destructive" });
      }
    );
  };

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      setLocationSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Location search failed:", error);
    }
  };

  const handleLocationInputChange = (value: string) => {
    setLocationSearch(value);
    setProfile((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        location: value,
      },
    }));

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  const selectLocationSuggestion = (suggestion: LocationSuggestion) => {
    const locationString = suggestion.display_name;
    setProfile((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        location: locationString,
      },
    }));
    setLocationSearch(locationString);
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const fetchUserProfile = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      toast({ title: "User ID not found", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/auth/${userId}`);
      const userData = response.data;

      let condition = "";
      let location = "";

      try {
        const researcherResponse = await axios.get(`${API_URL}/onboarding/researcher`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const researcherData = researcherResponse.data;
        condition = researcherData.condition || "";
        location = researcherData.location || "";
      } catch (researcherError: any) {
        console.warn("Researcher profile not found or error fetching:", researcherError);
        condition = userData.condition || userData.expertise || "";
        location = userData.location || "";
      }

      const resolvedRole = getResearcherRole(userData.role ?? roleFromStorage);

      setProfile({
        personal: {
          firstName:
            userData.firstName ||
            userData.firstname ||
            userData.fullName ||
            userData.full_name ||
            userData.name ||
            localStorage.getItem("username") ||
            "",
          email: userData.email,
          password: userData.password,
          role: resolvedRole,
        },
        details: {
          condition,
          location,
          avatar: userData.avatar || userData.profile_picture || "",
        },
      });

      if (location) {
        setLocationSearch(location);
      } else {
        setLocationSearch("");
      }
    } catch (error) {
      console.error("Failed to fetch researcher profile:", error);
      toast({ title: "Failed to load profile data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, roleFromStorage, token, userId]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <Navbar showSearch />
      <div className="min-h-screen bg-gradient-to-br from-[#f6fbfa] via-[#effffc] to-[#f6fbfa] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {isLoading ? (
            <div className="bg-card rounded-2xl shadow-lg shadow-mute p-8 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="bg-card rounded-2xl shadow-lg shadow-mute p-8 space-y-6 relative">

              <div className="flex flex-col items-center space-y-4 pb-6 border-b border-border">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-teal-light shadow-soft">
                    <AvatarImage src={profile.details.avatar} alt={profile.personal.firstName || "Researcher"} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                      {profile.personal.firstName
                        ? profile.personal.firstName
                            .split(" ")
                            .filter(Boolean)
                            .map((n) => n[0]?.toUpperCase())
                            .join("")
                        : "RP"}
                    </AvatarFallback>
                  </Avatar>
                  {(isEditingAuth || isEditingOnboarding) && (
                    <button className="absolute inset-0 flex items-center justify-center bg-primary/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-6 w-6 text-primary-foreground" />
                    </button>
                  )}
                </div>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground">{profile.personal.firstName || "Researcher"}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Keep your research insights current so patients can find you faster.
                  </p>
                </div>
              </div>

              {/* Account Information Section */}
              <div className="space-y-5 pb-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Account Information</h2>
                  {!isEditingAuth && (
                    <Button
                      onClick={handleEditAuth}
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full hover:bg-[#f6fbfa]"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-2 text-foreground font-medium">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={profile.personal.firstName}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        personal: {
                          ...prev.personal,
                          firstName: e.target.value,
                        },
                      }))
                    }
                    disabled={!isEditingAuth}
                    className="h-12 bg-[#f6fbfa] border-border focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-foreground font-medium">
                    <Mail className="h-4 w-4 text-primary" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.personal.email}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        personal: {
                          ...prev.personal,
                          email: e.target.value,
                        },
                      }))
                    }
                    disabled={!isEditingAuth}
                    className="h-12 bg-[#f6fbfa] border-border focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2 text-foreground font-medium">
                    <Lock className="h-4 w-4 text-primary" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={profile.personal.password}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        personal: {
                          ...prev.personal,
                          password: e.target.value,
                        },
                      }))
                    }
                    disabled={!isEditingAuth}
                    placeholder="Enter new password"
                    className="h-12 bg-[#f6fbfa] border-border focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2 text-foreground font-medium">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Role
                  </Label>
                  <Input
                    id="role"
                    value={
                      profile.personal.role === "researcher"
                        ? "Researcher"
                        : profile.personal.role || "Researcher"
                    }
                    disabled
                    className="h-12 bg-[#f6fbfa] border-border text-foreground"
                  />
                </div>

                {isEditingAuth && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveAuth}
                      className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft transition-all hover:shadow-md"
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setIsEditingAuth(false)}
                      variant="outline"
                      className="flex-1 h-12 border-2 border-primary text-primary hover:bg-teal-soft transition-colors"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Research Profile Section */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Research Profile</h2>
                  {!isEditingOnboarding && (
                    <Button
                      onClick={handleEditOnboarding}
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full hover:bg-[#f6fbfa]"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition" className="flex items-center gap-2 text-foreground font-medium">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Research Focus
                  </Label>
                  <Input
                    id="condition"
                    value={profile.details.condition}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        details: {
                          ...prev.details,
                          condition: e.target.value,
                        },
                      }))
                    }
                    disabled={!isEditingOnboarding}
                    placeholder="e.g., Diabetes management, Rare diseases"
                    className="h-12 bg-[#f6fbfa] border-border focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2 text-foreground font-medium">
                    <MapPin className="h-4 w-4 text-primary" />
                    Location
                  </Label>
                  <div className="relative">
                    <div className="flex gap-2">
                      <Input
                        id="location"
                        value={isEditingOnboarding ? locationSearch : profile.details.location}
                        onChange={(e) => handleLocationInputChange(e.target.value)}
                        onFocus={() => isEditingOnboarding && locationSuggestions.length > 0 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        disabled={!isEditingOnboarding}
                        placeholder="City, State or Country"
                        className="h-12 bg-[#f6fbfa] border-border focus:border-primary transition-colors flex-1"
                      />
                      {isEditingOnboarding && (
                        <Button
                          type="button"
                          onClick={getCurrentLocation}
                          disabled={isLocating}
                          size="icon"
                          className="h-12 w-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                    {showSuggestions && locationSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                        {locationSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectLocationSuggestion(suggestion)}
                            className={cn(
                              "w-full px-4 py-3 text-left hover:bg-secondary transition-colors",
                              "text-sm text-foreground border-b border-border last:border-b-0"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{suggestion.display_name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {isEditingOnboarding && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveOnboarding}
                      className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft transition-all hover:shadow-md"
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setIsEditingOnboarding(false)}
                      variant="outline"
                      className="flex-1 h-12 border-2 border-primary text-primary hover:bg-teal-soft transition-colors"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};


