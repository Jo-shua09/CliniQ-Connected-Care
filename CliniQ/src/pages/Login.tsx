import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Heart, Lock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("cliniq_user");
    if (storedUser) {
      // Pre-fill email if user exists
      const userData = JSON.parse(storedUser);
      setEmail(userData.email || "");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Check localStorage for existing user
    const storedUser = localStorage.getItem("cliniq_user");

    setTimeout(() => {
      setIsLoading(false);

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        toast({
          title: "Welcome back!",
          description: `Logged in as ${userData.firstName} with ${userData.subscription} plan.`,
        });
        navigate("/dashboard");
      } else {
        // Default user for demo purposes while the BE is in development
        const defaultUser = {
          username: "johndoe",
          firstName: "John",
          lastName: "Doe",
          email: email,
          age: 30,
          gender: "male",
          phone: "123-456-7890",
          subscription: "standard",
        };
        localStorage.setItem("cliniq_user", JSON.stringify(defaultUser));
        toast({
          title: "Welcome!",
          description: "You've been logged in with Standard plan.",
        });
        navigate("/dashboard");
      }
    }, 1000);
  };

  return (
    <div>
      <div className="flex min-h-screen">
        {/* Left Side - Form */}
        <div className="flex w-full flex-col justify-center px-4 sm:px-8 lg:w-1/2 lg:px-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mx-auto w-full max-w-md">
            <Link to="/" className="mb-6 sm:mb-8 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-hero">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold text-foreground">CliniQ</span>
            </Link>

            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">Sign in to continue your health journey</p>

            <form onSubmit={handleLogin} className="mt-6 sm:mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="username"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs sm:text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-xs sm:text-sm font-normal">
                  Remember me for 30 days
                </Label>
              </div>

              <Button type="submit" className="w-full gap-2" size="lg" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-primary hover:underline">
                Create account
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Right Side - Image/Branding */}
        <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center gradient-hero">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-md p-8 text-center text-primary-foreground"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Heart className="h-10 w-10" />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold">Connected Health Monitoring</h2>
            <p className="mt-4 text-sm md:text-base text-primary-foreground/80">
              Monitor vitals, share health data with loved ones, and get AI-powered insights - all in one secure platform.
            </p>
            <div className="mt-8 flex justify-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold">50K+</p>
                <p className="text-xs md:text-sm text-primary-foreground/70">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold">99.9%</p>
                <p className="text-xs md:text-sm text-primary-foreground/70">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold">HIPAA</p>
                <p className="text-xs md:text-sm text-primary-foreground/70">Compliant</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
