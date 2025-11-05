import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, User, Menu, LogOut, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { authService } from "@/services/authService";

interface NavbarProps {
  showSearch?: boolean;
}

export const Navbar = ({ showSearch = false }: NavbarProps) => {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());

  const navLinks = [
    { label: "Dashboard", path: "/" },
  ];

  const [shouldLogout, setShouldLogout] = useState(false);

  const handleLogout = () => {
    setShouldLogout(true);
  }

  useEffect(() => {
    const handler = () => setIsAuthenticated(authService.isAuthenticated());
    window.addEventListener('authChange', handler);
    return () => window.removeEventListener('authChange', handler);
  }, []);

  useEffect(() => {
    if (!shouldLogout) return;
    navigate("/");
    authService.logout();
    toast.success("Logged out successfully");
    setShouldLogout(false);
  }, [shouldLogout, navigate]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to={isAuthenticated ? authService.getRole() === 0 ? "/patient-dashboard" : "/researcher-dashboard" : "/"} className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
          <span className="text-xl font-bold text-foreground">CuraLink</span>
        </Link>

        {/* Desktop Search */}
        {showSearch && (
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trials, experts, publications..."
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {showSearch && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/favorites")}
              >
                <Heart className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
                  <DropdownMenuItem onClick={() => handleLogout()}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {!showSearch && (
            <div className="flex items-center space-x-4">
              <Link to="/user">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/user">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col space-y-4 mt-8">
              {showSearch && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-10"
                    />
                  </div>
                  {navLinks.map((link) => (
                    <Link key={link.path} to={link.path}>
                      <Button variant="ghost" className="w-full justify-start">
                      <LayoutDashboard className="h-4 w-4 mr-2 md:flex lg:flex" />
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                  <Button onClick={()=>navigate("/favorites")} variant="ghost" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2 md:flex lg:flex" />
                    Favorites
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2 md:flex lg:flex" />
                    Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => handleLogout()}>
                    <LogOut className="h-4 w-4 mr-2 md:flex lg:flex" />
                    Logout
                  </Button>
                </>
              )}
              {!showSearch && (
                <>
                  <Link to="/user">
                    <Button variant="ghost" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/user">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
