import SubscriptionModal from "@/components/modals/SubscriptionModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Heart, Lock, Mail, Phone, User, Users } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    surname: "",
    email: "",
    phone_number: "",
    age: "",
    gender: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting signup with:", formData);

      // Prepare data
      const signupData = {
        username: formData.username.trim(),
        first_name: formData.first_name.trim(),
        surname: formData.surname.trim(),
        email: formData.email.trim().toLowerCase(),
        phone_number: formData.phone_number.trim() || "", // Empty string if not provided
        age: formData.age.trim(),
        gender: formData.gender,
        password: formData.password,
      };

      console.log("Sending signup request with data:", signupData);

      // Try direct fetch to get better error information
      const params = new URLSearchParams();
      Object.entries(signupData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const url = `https://cliniq2.pythonanywhere.com/signup?${params.toString()}`;
      console.log("Full URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status, response.statusText);

      const result = await response.json();
      console.log("Response data:", result);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (result.success) {
        // Store complete user data for subscription selection
        const tempUser = {
          username: signupData.username,
          first_name: signupData.first_name,
          surname: signupData.surname,
          email: signupData.email,
          phone_number: signupData.phone_number,
          age: signupData.age,
          gender: signupData.gender,
          subscription: "standard" as const,
        };
        localStorage.setItem("cliniq_user_temp", JSON.stringify(tempUser));

        setIsLoading(false);
        setShowSubscriptionModal(true);
        toast({
          title: "Account created successfully!",
          description: "Please select your subscription plan.",
        });
      } else {
        // Check for common issues
        let errorMessage = "Signup failed. Possible reasons:";

        if (signupData.username.length < 3) {
          errorMessage += "\n- Username too short (min 3 characters)";
        }
        if (signupData.password.length < 8) {
          errorMessage += "\n- Password too short (min 8 characters)";
        }
        if (!signupData.email.includes("@")) {
          errorMessage += "\n- Invalid email format";
        }
        if (isNaN(Number(signupData.age)) || Number(signupData.age) < 1) {
          errorMessage += "\n- Invalid age";
        }

        throw new Error(errorMessage + "\n- Username or email may already exist");
      }
    } catch (error: any) {
      console.error("Signup error details:", error);
      setIsLoading(false);

      let errorMessage = "An error occurred during signup";
      if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSubscriptionSelect = async (plan: "standard" | "premium") => {
    try {
      const tempUserStr = localStorage.getItem("cliniq_user_temp");
      if (!tempUserStr) {
        throw new Error("No user data found. Please sign up again.");
      }

      const tempUser = JSON.parse(tempUserStr);
      console.log("Setting subscription for:", tempUser.username);

      // Try different value formats - backend might expect different format
      let valueToSend;

      // Option 1: Try boolean string (what we're currently doing)
      valueToSend = plan === "premium" ? "true" : "false";

      console.log("Attempt 1 - Setting premium with boolean string:", { username: tempUser.username, value: valueToSend });

      try {
        await apiClient.setPremium({
          username: tempUser.username,
          value: valueToSend,
        });
      } catch (error1) {
        console.log("Attempt 1 failed:", error1);

        // Option 2: Try plan name directly
        valueToSend = plan; // "standard" or "premium"
        console.log("Attempt 2 - Setting premium with plan name:", { username: tempUser.username, value: valueToSend });

        try {
          await apiClient.setPremium({
            username: tempUser.username,
            value: valueToSend,
          });
        } catch (error2) {
          console.log("Attempt 2 failed:", error2);

          // Option 3: Try "1" for premium, "0" for standard
          valueToSend = plan === "premium" ? "1" : "0";
          console.log("Attempt 3 - Setting premium with numeric string:", { username: tempUser.username, value: valueToSend });

          try {
            await apiClient.setPremium({
              username: tempUser.username,
              value: valueToSend,
            });
          } catch (error3) {
            console.log("Attempt 3 failed:", error3);
            throw new Error("Could not set subscription. The backend may not support this feature yet.");
          }
        }
      }

      // Store final user data
      const userWithSubscription = {
        ...tempUser,
        subscription: plan,
      };

      // Create simple token for auth
      const token = `user_${tempUser.username}_${Date.now()}`;

      localStorage.setItem("cliniq_user", JSON.stringify(userWithSubscription));
      localStorage.setItem("auth_token", token);
      localStorage.removeItem("cliniq_user_temp");

      toast({
        title: "Welcome to CliniQ!",
        description: `Your ${plan === "premium" ? "Premium" : "Standard"} plan is now active.`,
      });

      // Navigate to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error: any) {
      console.error("Subscription error:", error);

      // Even if setPremium fails, we can still let the user continue with standard plan
      if (error.message.includes("Could not set subscription")) {
        const tempUserStr = localStorage.getItem("cliniq_user_temp");
        if (tempUserStr) {
          const tempUser = JSON.parse(tempUserStr);
          const userWithSubscription = {
            ...tempUser,
            subscription: "standard", // Default to standard if premium fails
          };

          const token = `user_${tempUser.username}_${Date.now()}`;

          localStorage.setItem("cliniq_user", JSON.stringify(userWithSubscription));
          localStorage.setItem("auth_token", token);
          localStorage.removeItem("cliniq_user_temp");

          toast({
            title: "Account created!",
            description: "Your account has been created with Standard plan. You can upgrade later in settings.",
          });

          setTimeout(() => {
            navigate("/dashboard");
          }, 500);
          return;
        }
      }

      toast({
        title: "Subscription failed",
        description: error.message || "Could not set subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center gradient-hero">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md p-8 text-center text-primary-foreground"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Heart className="h-10 w-10" />
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold">Start Your Health Journey</h2>
          <p className="mt-4 text-sm md:text-base text-primary-foreground/80">
            Join thousands of users who trust CliniQ to monitor and share their health data securely with family and healthcare providers.
          </p>
          <div className="mt-8 space-y-3 text-left">
            {["Consent-based health sharing", "Real-time vitals from connected devices", "AI-powered health insights", "End-to-end encryption"].map(
              (feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="rounded-full bg-white/20 p-1">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
      {/* Right Side - Form */}
      <div className="flex w-full flex-col justify-center py-2 px-4 sm:px-8 lg:w-1/2 lg:px-10">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mx-auto w-full max-w-xl">
          <Link to="/" className="mb-6 sm:mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-hero">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">CliniQ</span>
          </Link>

          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">Create account</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">Start monitoring your health today</p>

          <form onSubmit={handleSignup} className="mt-6 sm:mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  placeholder="username"
                  className="pl-10"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="first_name"
                    name="first_name"
                    placeholder="John"
                    className="pl-10"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Last Name</Label>
                <Input id="surname" name="surname" placeholder="Doe" value={formData.surname} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="pl-10"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input id="age" name="age" placeholder="26" className="pl-10" value={formData.age} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(checked as boolean)} />
              <Label htmlFor="terms" className="text-xs sm:text-sm font-normal leading-tight">
                I agree to share my health data according to CliniQ's{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full gap-2" size="lg" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      <SubscriptionModal open={showSubscriptionModal} onSelect={handleSubscriptionSelect} />
    </div>
  );
}
