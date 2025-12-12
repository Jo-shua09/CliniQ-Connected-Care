import { Button } from "@/components/ui/button";
import { Activity, Heart, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const features = [
    {
      icon: Users,
      title: "Health Network",
      description: "Monitor loved ones with consent-based access to health data",
    },
    {
      icon: Activity,
      title: "Live Vitals",
      description: "Real-time health metrics from connected devices",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Full control over who sees your health information",
    },
  ];

  const benefits = ["HIPAA Compliant", "End-to-end Encryption", "24/7 AI Health Assistant", "Device Agnostic"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg gradient-hero">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg sm:text-xl font-bold text-foreground">CliniQ</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                Sign in
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
