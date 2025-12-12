import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Camera, Link2, Save, Shield, Bell, Download, Trash2, Crown, Zap, Eye, EyeOff, User, Mail, Phone, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient, getAuthToken } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { ConnectDeviceModal } from "@/components/modals/ConnectDeviceModal";

interface User {
  username: string;
  first_name: string;
  surname: string;
  email: string;
  phone_number?: string;
  age: string;
  gender: string;
  password?: string;
  subscription: "standard" | "premium";
}

export default function Settings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [connectDeviceOpen, setConnectDeviceOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState({
    healthAlerts: true,
    connectionRequests: true,
    deviceStatus: true,
    weeklyReport: false,
  });
  const [showPassword, setShowPassword] = useState(false);
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // First get stored user to extract username
        const storedUser = localStorage.getItem("cliniq_user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const username = parsedUser.username;

          if (username) {
            // Fetch fresh profile from API using username
            const userProfile = await apiClient.getUserProfile(username);
            setUser(userProfile);
            setFormData({
              username: userProfile.username || "",
              first_name: userProfile.first_name || "",
              surname: userProfile.surname || "",
              email: userProfile.email || "",
              phone_number: userProfile.phone_number || "",
              age: userProfile.age || "",
              gender: userProfile.gender || "",
              password: userProfile.password || "",
            });
          } else {
            // Use stored data if no username
            setUser(parsedUser);
            setFormData({
              username: parsedUser.username || "",
              first_name: parsedUser.first_name || parsedUser.firstName || "",
              surname: parsedUser.surname || parsedUser.lastName || "",
              email: parsedUser.email || "",
              phone_number: parsedUser.phone_number || parsedUser.phone || "",
              age: parsedUser.age || "",
              gender: parsedUser.gender || "",
              password: parsedUser.password || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        // Fallback to localStorage
        const storedUser = localStorage.getItem("cliniq_user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setFormData({
            username: parsedUser.username || "",
            first_name: parsedUser.first_name || parsedUser.firstName || "",
            surname: parsedUser.surname || parsedUser.lastName || "",
            email: parsedUser.email || "",
            phone_number: parsedUser.phone_number || parsedUser.phone || "",
            age: parsedUser.age || "",
            gender: parsedUser.gender || "",
            password: parsedUser.password || "",
          });
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveProfile = async () => {
    try {
      if (!user?.username) {
        throw new Error("Username not found");
      }

      const updatedUser = await apiClient.updateUserProfile(formData); // Pass formData directly
      setUser({ ...updatedUser, password: formData.password });
      toast({
        title: "Profile updated",
        description: "Your profile settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export started",
      description: "Your health data is being prepared for download.",
    });
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem("cliniq_user");
    toast({
      title: "Account deletion requested",
      description: "You will receive an email to confirm account deletion.",
      variant: "destructive",
    });
  };

  const handleSubscriptionSelect = async (plan: "standard" | "premium") => {
    try {
      if (!user?.username) {
        throw new Error("Username not found. Please log out and log back in.");
      }

      console.log("Changing subscription for:", user.username, "to:", plan);

      // Prepare value - backend expects "true" for premium, "false" for standard
      const valueToSend = plan === "premium" ? "true" : "false";

      // Call API to update subscription
      const result = await apiClient.setPremium({
        username: user.username,
        value: valueToSend,
      });

      console.log("Set premium result:", result);

      // Update local user state and localStorage
      const updatedUser = { ...user, subscription: plan };
      localStorage.setItem("cliniq_user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast({
        title: "Subscription updated",
        description: `Your plan has been successfully changed to ${plan}.`,
      });
    } catch (error: any) {
      console.error("Subscription update error:", error);

      // If backend fails, still update locally
      if (user) {
        const updatedUser = { ...user, subscription: plan };
        localStorage.setItem("cliniq_user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        toast({
          title: "Subscription updated locally",
          description: `Your plan has been changed to ${plan}. Backend sync may be pending.`,
        });
      } else {
        toast({
          title: "Failed to update subscription",
          description: error.message || "An error occurred while updating your subscription.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpgradePlan = async () => {
    if (!user?.username) {
      toast({
        title: "Error",
        description: "User information not found.",
        variant: "destructive",
      });
      return;
    }

    if (user?.subscription === "premium") {
      toast({
        title: "Already Premium",
        description: "You are already on the premium plan.",
      });
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm("Upgrade to Premium for $9.99/month?");
    if (!confirmed) return;

    await handleSubscriptionSelect("premium");
  };

  const handleDowngradePlan = async () => {
    if (!user?.username) {
      toast({
        title: "Error",
        description: "User information not found.",
        variant: "destructive",
      });
      return;
    }

    if (user?.subscription === "standard") {
      toast({
        title: "Already Standard",
        description: "You are already on the standard plan.",
      });
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm("Downgrade to Standard plan? You'll lose access to premium features.");
    if (!confirmed) return;

    await handleSubscriptionSelect("standard");
  };

  const isProfessional = user?.subscription === "premium";

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your account and preferences</p>
        </motion.div>

        {/* Subscription Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card"
        >
          <div className="flex items-center gap-2 mb-4">
            {isProfessional ? <Crown className="h-5 w-5 text-secondary" /> : <Zap className="h-5 w-5 text-primary" />}
            <h2 className="font-heading text-base sm:text-lg font-semibold text-foreground">Subscription</h2>
            <Badge variant={isProfessional ? "default" : "secondary"} className="ml-auto">
              {isProfessional ? "premium" : "Standard"}
            </Badge>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            {isProfessional
              ? "You have access to all advanced metrics including EP Estimation, Ventricular Contraction, and Muscle Activity."
              : "Upgrade to premium for advanced health metrics and analytics."}
          </p>

          {isProfessional ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full text-sm">
                  Downgrade to Standard
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Downgrade to Standard?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll lose access to EP Estimation, Ventricular Contraction, and Muscle Activity monitoring.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDowngradePlan}>Downgrade</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button className="w-full gap-2 text-sm" onClick={handleUpgradePlan}>
              <Crown className="h-4 w-4" />
              Upgrade to premium - $9.99/mo
            </Button>
          )}
        </motion.div>

        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card"
        >
          <h2 className="font-heading text-base sm:text-lg font-semibold text-foreground">Profile Settings</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage your personal information and preferences</p>

          {/* Avatar */}
          <div className="mt-4 sm:mt-6 flex items-center gap-3 sm:gap-4">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-muted font-heading text-xl sm:text-2xl font-semibold text-muted-foreground">
              {user?.first_name?.[0] || "J"}
              {user?.surname?.[0] || "D"}
            </div>
            <div>
              <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
                <Camera className="h-4 w-4" />
                Change Avatar
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or GIF, max 5MB</p>
            </div>
          </div>

          {/* Form */}
          <div className="mt-4 sm:mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs sm:text-sm">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-xs sm:text-sm">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname" className="text-xs sm:text-sm">
                  Last Name
                </Label>
                <Input
                  id="surname"
                  name="surname"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.surname}
                  onChange={handleChange}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-xs sm:text-sm">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-xs sm:text-sm">
                  Age
                </Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={handleChange}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-xs sm:text-sm">
                  Gender
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button className="w-full gap-2 text-sm" onClick={handleSaveProfile}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </motion.div>

        {/* Device Connection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card"
        >
          <h2 className="font-heading text-base sm:text-lg font-semibold text-foreground">Device Connection</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Connect your health monitoring device to sync data</p>

          <Button variant="outline" className="mt-4 w-full gap-2 text-sm" onClick={() => setConnectDeviceOpen(true)}>
            <Link2 className="h-4 w-4" />
            Connect Device
          </Button>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card"
        >
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h2 className="font-heading text-base sm:text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage how you receive alerts</p>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm sm:text-base text-foreground">Health Alerts</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Abnormal vital readings</p>
              </div>
              <Switch
                checked={notifications.healthAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, healthAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm sm:text-base text-foreground">Connection Requests</p>
                <p className="text-xs sm:text-sm text-muted-foreground">New monitoring requests</p>
              </div>
              <Switch
                checked={notifications.connectionRequests}
                onCheckedChange={(checked) => setNotifications({ ...notifications, connectionRequests: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm sm:text-base text-foreground">Device Status</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Connection and battery alerts</p>
              </div>
              <Switch
                checked={notifications.deviceStatus}
                onCheckedChange={(checked) => setNotifications({ ...notifications, deviceStatus: checked })}
              />
            </div>
          </div>
        </motion.div>

        {/* Privacy & Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h2 className="font-heading text-base sm:text-lg font-semibold text-foreground">Privacy & Data</h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage your data and privacy settings</p>

          <div className="mt-4 space-y-3">
            <Button variant="outline" className="w-full gap-2 text-sm" onClick={handleExportData}>
              <Download className="h-4 w-4" />
              Export Health Data
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 text-sm">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your health data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <ConnectDeviceModal open={connectDeviceOpen} onOpenChange={setConnectDeviceOpen} />
    </AppLayout>
  );
}
