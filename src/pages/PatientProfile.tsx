import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Heart, MapPin, Camera, Edit2, Navigation, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/apiConfig";

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export const PatientProfile = () => {

  const userId = localStorage.getItem("userId");
  const roleFromStorage = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // Helper function to convert numeric role to string
  const getRoleString = (roleValue: any): string => {
    if (typeof roleValue === "string") {
      // If it's already a string like "patient" or "caregiver", return it
      if (roleValue === "patient" || roleValue === "caregiver" || roleValue === "researcher") {
        return roleValue === "researcher" ? "caregiver" : roleValue;
      }
      // If it's a numeric string, convert it
      const numRole = Number(roleValue);
      return numRole === 0 ? "patient" : numRole === 1 ? "caregiver" : "";
    }
    if (typeof roleValue === "number") {
      return roleValue === 0 ? "patient" : roleValue === 1 ? "caregiver" : "";
    }
    return "";
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [profile, setProfile] = useState({
    fullName: localStorage.getItem("username") || "",
    email: "john.doe@email.com",
    role: getRoleString(roleFromStorage) || "",
    condition: "Type 2 Diabetes",
    location: "San Francisco, CA",
    avatar: "",
  });

  const API_URL = getApiBaseUrl()

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Determine if user is a researcher (role 1) or patient (role 0)
      const isResearcher = profile.role === "caregiver" || profile.role === "researcher" || 
                          roleFromStorage === "1" || Number(roleFromStorage) === 1;
      
      if (isResearcher) {
        // Update researcher profile
        const updateData: { condition: string; location?: string } = {
          condition: profile.condition || "",
        };
        
        if (profile.location && profile.location.trim()) {
          updateData.location = profile.location.trim();
        }
        
        await axios.put(`${API_URL}/onboarding/researcher/${userId}`, updateData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // Update patient profile
        const updateData: { condition: string; location?: string } = {
          condition: profile.condition || "",
        };
        
        if (profile.location && profile.location.trim()) {
          updateData.location = profile.location.trim();
        }
        
        await axios.put(`${API_URL}/onboarding/patient/${userId}`, updateData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      
      setIsEditing(false);
      toast({ title: "Profile updated successfully!" });
      
      // Refresh profile data
      await fetchUserProfile();
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      toast({
        title: error.response?.data?.detail || error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setLocationSearch(profile.location);
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
          // Reverse geocoding using Nominatim
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = response.data;

          const locationString = data.address
            ? `${data.address.city || data.address.town || data.address.village || ''}, ${data.address.state || ''}, ${data.address.country || ''}`
              .replace(/^,\s*/, '')
              .replace(/,\s*,/g, ',')
              .trim()
            : data.display_name;

          setProfile({ ...profile, location: locationString });
          setLocationSearch(locationString);
          toast({ title: "Location updated!" });
        } catch (error) {
          toast({ title: "Failed to get location details", variant: "destructive" });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
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
      const data = response.data;
      setLocationSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Location search failed:", error);
    }
  };

  const handleLocationInputChange = (value: string) => {
    setLocationSearch(value);
    setProfile({ ...profile, location: value });

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  const selectLocationSuggestion = (suggestion: LocationSuggestion) => {
    const locationString = suggestion.display_name;
    setProfile({ ...profile, location: locationString });
    setLocationSearch(locationString);
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  // Fetch user profile data from API
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
      console.log("User Data: ", userData);

      // Update profile with fetched data
      const apiRole = userData.role !== undefined ? userData.role : roleFromStorage;
      const roleString = getRoleString(apiRole) || getRoleString(roleFromStorage) || "";
      console.log("API Role:", apiRole, "Role from Storage:", roleFromStorage, "Converted Role:", roleString);
      
      // Determine if user is a researcher
      const isResearcher = apiRole === 1 || roleFromStorage === "1" || Number(roleFromStorage) === 1;
      
      let condition = "";
      let location = "";
      
      if (isResearcher) {
        // Fetch researcher profile data
        try {
          const researcherResponse = await axios.get(`${API_URL}/onboarding/researcher/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const researcherData = researcherResponse.data;
          console.log("Researcher Data: ", researcherData);
          condition = researcherData.condition || "";
          location = researcherData.location || "";
        } catch (researcherError: any) {
          console.warn("Researcher profile not found or error fetching:", researcherError);
          // If researcher profile doesn't exist yet, use defaults
          condition = userData.condition || userData.medical_condition || "";
          location = userData.location || "";
        }
      } else {
        // For patients, try to get patient profile data
        try {
          const patientResponse = await axios.get(`${API_URL}/onboarding/patient/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const patientData = patientResponse.data;
          console.log("Patient Data: ", patientData);
          condition = patientData.condition || "";
          location = patientData.location || "";
        } catch (patientError: any) {
          console.warn("Patient profile not found or error fetching:", patientError);
          // Fallback to user data
          condition = userData.condition || userData.medical_condition || "";
          location = userData.location || "";
        }
      }
      
      setProfile({
        fullName: userData.fullName || userData.full_name || userData.name || localStorage.getItem("username") || "",
        email: userData.email,
        role: roleString,
        condition: condition,
        location: location,
        avatar: userData.avatar || userData.profile_picture || "",
      });
      
      // Initialize locationSearch with the fetched location
      if (location) {
        setLocationSearch(location);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      toast({ title: "Failed to load profile data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [userId, roleFromStorage, token, API_URL]);

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
              {/* Edit Button - Top Right */}
              {!isEditing && (
                <Button
                  onClick={handleEdit}
                  size="icon"
                  variant="ghost"
                  className="absolute top-4 right-4 h-9 w-9 rounded-full hover:bg-[#f6fbfa]"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}

              {/* Header with Avatar */}
              <div className="flex flex-col items-center space-y-4 pb-6 border-b border-border">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-teal-light shadow-soft">
                    <AvatarImage src={profile.avatar} alt={profile.fullName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                      {profile.fullName.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <button className="absolute inset-0 flex items-center justify-center bg-primary/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-6 w-6 text-primary-foreground" />
                    </button>
                  )}
                </div>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground">{profile.fullName}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Keep your info up to date to connect with the right researchers
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2 text-foreground font-medium">
                    <User className="h-4 w-4 text-primary" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    disabled={!isEditing}
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
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 bg-[#f6fbfa] border-border focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2 text-foreground font-medium">
                    <User className="h-4 w-4 text-primary" />
                    Role
                  </Label>
                  <Select
                    value={profile.role}
                    onValueChange={(value) => setProfile({ ...profile, role: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="h-12 bg-[#f6fbfa] border-border focus:border-primary">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="caregiver">Researcher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {roleFromStorage != "0" ? <Label htmlFor="condition" className="flex items-center gap-2 text-foreground font-medium">
                    <Heart className="h-4 w-4 text-primary" />
                    Experience
                  </Label> : <Label htmlFor="condition" className="flex items-center gap-2 text-foreground font-medium">
                    <Heart className="h-4 w-4 text-primary" />
                    Condition
                  </Label>}
                  <Input
                    id="condition"
                    value={profile.condition}
                    onChange={(e) => setProfile({ ...profile, condition: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter your medical condition or concern"
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
                        value={isEditing ? locationSearch : profile.location}
                        onChange={(e) => handleLocationInputChange(e.target.value)}
                        onFocus={() => isEditing && locationSuggestions.length > 0 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        disabled={!isEditing}
                        placeholder="City, State or Country"
                        className="h-12 bg-[#f6fbfa] border-border focus:border-primary transition-colors flex-1"
                      />
                      {isEditing && (
                        <Button
                          type="button"
                          onClick={getCurrentLocation}
                          disabled={isLocating}
                          size="icon"
                          className="h-12 w-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          {isLocating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Navigation className="h-4 w-4" />
                          )}
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
              </div>

              {/* Action Buttons - Only show in edit mode */}
              {isEditing && (
                <div className="flex gap-3 pt-6">
                  <Button
                    onClick={handleSave}
                    className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft transition-all hover:shadow-md"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="flex-1 h-12 border-2 border-primary text-primary hover:bg-teal-soft transition-colors"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
