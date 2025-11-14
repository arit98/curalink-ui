import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Heart, MapPin, Camera, Edit2, Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export const PatientProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [profile, setProfile] = useState({
    fullName: "John Doe",
    email: "john.doe@email.com",
    role: "patient",
    condition: "Type 2 Diabetes",
    location: "San Francisco, CA",
    avatar: "",
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleEdit = () => {
    setIsEditing(true);
    setLocationSearch(profile.location);
  };

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
          // Reverse geocoding using Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await response.json();
          
          const locationString = data.address
            ? `${data.address.city || data.address.town || data.address.village || ''}, ${data.address.state || ''}, ${data.address.country || ''}`
                .replace(/^,\s*/, '')
                .replace(/,\s*,/g, ',')
                .trim()
            : data.display_name;

          setProfile({ ...profile, location: locationString });
          setLocationSearch(locationString);
          toast.success("Location updated!");
        } catch (error) {
          toast.error("Failed to get location details");
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

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
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
                <SelectTrigger disabled className="h-12 bg-[#f6fbfa] border-border focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="caregiver">Researcher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition" className="flex items-center gap-2 text-foreground font-medium">
                <Heart className="h-4 w-4 text-primary" />
                Condition
              </Label>
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
      </div>
    </div>
    </>
  );
};
