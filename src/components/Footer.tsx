import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-secondary" />
            <span className="font-semibold text-foreground">CuraLink</span>
          </div>

          <div className="flex space-x-6 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2025 CuraLink. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
