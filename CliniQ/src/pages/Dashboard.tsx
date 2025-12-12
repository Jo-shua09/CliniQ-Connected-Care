import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Heart, Droplets, Thermometer, Wind, Activity, Zap, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { AIAssistant } from "@/components/sections/AIAssistant";
import { VitalCard } from "@/components/sections/VitalCard";
import { ConnectDeviceModal } from "@/components/modals/ConnectDeviceModal";
import { DeviceStatus } from "@/components/sections/DeviceStatus";
import { HealthScore } from "@/components/sections/HealthScore";
import { apiClient } from "@/lib/api";

interface User {
  username: string;
  first_name: string;
  surname: string;
  email: string;
  subscription: "standard" | "premium";
  age?: string;
  gender?: string;
}

export default function Dashboard() {
  const [connectDeviceOpen, setConnectDeviceOpen] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        // Get user from localStorage (stored during login)
        const storedUser = localStorage.getItem("cliniq_user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (parseError) {
            console.error("Failed to parse stored user:", parseError);
            // No default user - redirect to login
            window.location.href = "/login";
            return;
          }
        } else {
          // No user data - redirect to login
          window.location.href = "/login";
          return;
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        // Redirect to login on error
        window.location.href = "/login";
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const storedUser = localStorage.getItem("cliniq_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);

        if (user.username) {
          // Check if user has premium from backend
          const result = await apiClient.isPremium({ username: user.username });

          if (result.success) {
            // Update local storage with correct subscription status
            const updatedUser = { ...user, subscription: "premium" };
            localStorage.setItem("cliniq_user", JSON.stringify(updatedUser));

            // Update state if in Settings component
            if (setUser) setUser(updatedUser);
          }
        }
      }
    } catch (error) {
      console.log("Could not verify subscription status:", error);
    }
  };

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  // useEffect to check device status when component loads
  useEffect(() => {
    const checkDeviceStatus = async () => {
      try {
        const storedUser = localStorage.getItem("cliniq_user");
        if (storedUser) {
          const user = JSON.parse(storedUser);

          // Check if user has a device connected via API
          const hasDeviceResponse = await apiClient.hasDevice({ username: user.username });

          // Also check locally stored device_id as fallback
          if (hasDeviceResponse.success || user.device_id) {
            setDeviceConnected(true);
          }
        }
      } catch (error) {
        console.log("Could not verify device status:", error);
      }
    };

    checkDeviceStatus();
  }, []);

  const standardVitalsData = useMemo(
    () => [
      {
        icon: Heart,
        label: "Heart Rate",
        value: deviceConnected ? "67" : "-",
        unit: "bpm",
        status: "normal" as const,
        statusLabel: "Normal",
        lastUpdated: "Just now",
        color: "heart" as const,
      },
      {
        icon: Wind,
        label: "Oxygen Level",
        value: deviceConnected ? "95" : "-",
        unit: "%",
        status: "normal" as const,
        statusLabel: "Normal",
        lastUpdated: "Just now",
        color: "oxygen" as const,
      },
      {
        icon: Droplets,
        label: "Blood Sugar",
        value: deviceConnected ? "98" : "-",
        unit: "mg/dL",
        status: "normal" as const,
        statusLabel: "Normal",
        lastUpdated: "2 min ago",
        color: "pressure" as const,
      },
      {
        icon: Thermometer,
        label: "Temperature",
        value: deviceConnected ? "36.5" : "-",
        unit: "°C",
        status: "normal" as const,
        statusLabel: "Normal",
        lastUpdated: "Just now",
        color: "temperature" as const,
      },
    ],
    [deviceConnected]
  );

  const professionalVitalsData = useMemo(
    () => [
      {
        icon: Activity,
        label: "EP Estimation",
        value: deviceConnected ? "142" : "-",
        unit: "ms",
        status: "normal" as const,
        statusLabel: "Normal",
        lastUpdated: "Just now",
        color: "heart" as const,
      },
      {
        icon: Heart,
        label: "Ventricular Contraction",
        value: deviceConnected ? "68" : "-",
        unit: "%",
        status: "normal" as const,
        statusLabel: "Normal",
        lastUpdated: "Just now",
        color: "pressure" as const,
      },
      {
        icon: Zap,
        label: "Muscle Activity",
        value: deviceConnected ? "87" : "-",
        unit: "µV",
        status: "normal" as const,
        statusLabel: "Normal",
        lastUpdated: "Just now",
        color: "oxygen" as const,
      },
    ],
    [deviceConnected]
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No user data found</h2>
            <p className="text-muted-foreground mb-4">Please login again to access your dashboard.</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isProfessional = user?.subscription === "premium";

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Welcome back, <span className="font-medium text-foreground">{user?.username || "User"}</span>!
              </p>
            </div>
            <Badge variant={isProfessional ? "default" : "secondary"} className="w-fit flex items-center gap-1">
              {isProfessional ? <Crown className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
              {isProfessional ? "Premium" : "Standard"} Plan
            </Badge>
          </div>
        </motion.div>

        {/* Standard Vitals Section */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="font-heading text-base sm:text-lg font-semibold text-foreground">Your Vitals</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm text-muted-foreground">Check vitals:</span>
              <button onClick={() => setConnectDeviceOpen(true)}>
                <DeviceStatus connected={deviceConnected} />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {standardVitalsData.map((vital, idx) => (
              <VitalCard key={vital.label} {...vital} delay={idx} />
            ))}
          </div>
        </div>

        {/* Premium Vitals Section */}
        {isProfessional && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6 sm:mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
              <h2 className="font-heading text-base sm:text-lg font-semibold text-foreground">Advanced Metrics</h2>
              <Badge variant="secondary" className="text-xs">
                Pro
              </Badge>
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              {professionalVitalsData.map((vital, idx) => (
                <VitalCard key={vital.label} {...vital} delay={idx + 4} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Upgrade Banner for Standard users */}
        {!isProfessional && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 sm:mb-8 rounded-xl border border-secondary/30 bg-secondary/10 p-4 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
                  <Crown className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground">Upgrade to Premium</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Get access to EP Estimation, Ventricular Contraction, and Muscle Activity monitoring.
                  </p>
                </div>
              </div>
              <Link
                to="/settings"
                className="inline-flex items-center justify-center rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 transition-colors"
              >
                Upgrade Now
              </Link>
            </div>
          </motion.div>
        )}

        {/* AI Assistant */}
        <div>
          <AIAssistant status="good" message="Your vitals look stable. Keep maintaining your healthy routine." />
        </div>
      </div>

      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 sm:mb-8 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary/10 font-heading text-lg sm:text-xl font-bold text-primary">
              {user?.first_name?.[0] || user?.username?.[0] || "U"}
              {user?.surname?.[0] || ""}
            </div>
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-semibold text-foreground">
                {user?.first_name && user?.surname ? `${user.first_name} ${user.surname}` : user?.username || "User"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Device ID: <span className="font-mono">#P-1765433964199</span>
              </p>
            </div>
          </div>
          <HealthScore score="Good" lastUpdated="Last updated today" />
        </div>
      </motion.div>

      {/* Modals */}
      <ConnectDeviceModal open={connectDeviceOpen} onOpenChange={setConnectDeviceOpen} onDeviceConnected={() => setDeviceConnected(true)} />
    </AppLayout>
  );
}
