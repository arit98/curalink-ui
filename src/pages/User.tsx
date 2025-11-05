import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { toast } from 'react-toastify';
import { Mail, Lock, User as UserIcon } from "lucide-react";
import { authService } from "@/services/authService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UserProfile = () => {
  const navigate = useNavigate();

  // Auth states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting login with:", { email });
      const result = await authService.login({ email, password });
      console.log("Login result:", result);

      if (result.success) {
        toast.success("Signed in successfully");
        // Prefer the role returned by the login response, fall back to stored role
        const resolvedRole = result.role ?? authService.getRole();
        if (resolvedRole === 0) {
          navigate("/patient-dashboard");
        } else if (resolvedRole === 1) {
          navigate("/researcher-dashboard");
        } else {
          navigate("/");
        }
      } else {
        console.log("Login failed:", result.message);
        setError(result.message || "Login failed");
        toast.error(result.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await authService.register({
        email,
        password,
        name,
        role: role
      });

      if (result.success) {
        if (authService.getRole() == 0)
          navigate("/patient-onboarding");
        if (authService.getRole() == 1)
          navigate("/researcher-onboarding");
      } else {
        setError(result.message || "Registration failed");
        toast.error(result.message || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-accent/10 to-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Welcome to CuraLink</h1>
                <p className="text-muted-foreground">Please sign in or create an account</p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="login" className="w-full" onValueChange={(value) => setAuthMode(value as "login" | "register")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full mt-2"
                    size="lg"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-base">Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-base">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-base">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-role" className="text-base">Role</Label>
                    <Select value={String(role)} onValueChange={(value) => setRole(Number(value))}>
                      <SelectTrigger id="register-role" className="w-full">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Patient</SelectItem>
                        <SelectItem value="1">Researcher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="w-full mt-2"
                    size="lg"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;