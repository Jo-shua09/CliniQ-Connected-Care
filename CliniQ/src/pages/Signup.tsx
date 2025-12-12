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
import { apiClient, setAuthToken } from "@/lib/api";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
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
      const signupData = {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        age: formData.age,
        gender: formData.gender,
        password: formData.password,
      };

      const response = await apiClient.signup(signupData);

      // Store auth token and user data temporarily
      setAuthToken(response.token);
      localStorage.setItem("cliniq_user_temp", JSON.stringify(response.user));

      setIsLoading(false);
      setShowSubscriptionModal(true);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An error occurred during signup",
        variant: "destructive",
      });
    }
  };

  const handleSubscriptionSelect = async (plan: "standard" | "premium") => {
    try {
      const tempUser = JSON.parse(localStorage.getItem("cliniq_user_temp") || "{}");
      if (!tempUser.email) {
        throw new Error("No user data found");
      }

      // Set premium status using API
      await apiClient.setPremium({ email: tempUser.email, value: plan });

      // Store user data with selected subscription
      const userWithSubscription = { ...tempUser, subscription: plan };
      localStorage.setItem("cliniq_user", JSON.stringify(userWithSubscription));
      localStorage.removeItem("cliniq_user_temp"); // Clean up temp data

      toast({
        title: "Account created!",
        description: `Welcome to CliniQ with ${plan === "premium" ? "Premium" : "Standard"} plan.`,
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Failed to set subscription",
        description: error instanceof Error ? error.message : "An error occurred",
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
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    className="pl-10"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
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
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="pl-10"
                  value={formData.phone}
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
