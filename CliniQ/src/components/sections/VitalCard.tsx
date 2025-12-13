import { pullVitals } from "@/lib/getVitals";
import { Activity, Heart, Thermometer, Droplets, Zap, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { useAuth } from "@/hooks/useAuth";

type VitalStatus = "normal" | "low" | "slightly-high" | "high" | "critical";

interface Vital {
  name: string;
  value: string | number;
  unit: string;
  status: VitalStatus;
  icon: React.ElementType;
  lastUpdated: string;
}

interface VitalCardProps {
  onVitalsUpdate?: (vitals: Vital[]) => void;
  onDeviceStatusUpdate?: (online: boolean) => void;
}

interface VitalsData {
  spo2?: number;
  bpm?: number;
  temp?: number;
  sbp?: number;
  dbp?: number;
  current_step_count?: number;
  alert?: string;
  online?: boolean;
  ecg_sensor_frame?: unknown;
  time_diff_seconds?: unknown;
}

export default function VitalCard({ onVitalsUpdate, onDeviceStatusUpdate }: VitalCardProps) {
  const [vitals, setVitals] = useState<VitalsData | null>(null);
  const [lastVitalsData, setLastVitalsData] = useState<VitalsData | null>(() => {
    const stored = localStorage.getItem("lastVitals");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date | null>(() => {
    const stored = localStorage.getItem("lastUpdatedTime");
    return stored ? new Date(stored) : null;
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const data = await pullVitals();
        if (data) {
          if (data.online) {
            setVitals(data);
            setLastVitalsData(data);
            localStorage.setItem("lastVitals", JSON.stringify(data));
            const now = new Date();
            setLastUpdatedTime(now);
            localStorage.setItem("lastUpdatedTime", now.toISOString());

            // Build the array of vitals and send it upward
            const formatted = [
              {
                name: "Blood Pressure",
                value: `${data.sbp}/${data.dbp}`,
                unit: "mmHg",
                status: getStatus("Blood Pressure", `${data.sbp}/${data.dbp}`),
                icon: Heart,
                lastUpdated: now.toLocaleString(),
              },
              {
                name: "Heart Rate",
                value: data.bpm || 0,
                unit: "bpm",
                status: getStatus("Heart Rate", data.bpm || 0),
                icon: Activity,
                lastUpdated: now.toLocaleString(),
              },
              {
                name: "Temperature",
                value: data.temp || 0,
                unit: "°C",
                status: getStatus("Temperature", data.temp || 0),
                icon: Thermometer,
                lastUpdated: now.toLocaleString(),
              },
              {
                name: "Oxygen Level",
                value: data.spo2 || 0,
                unit: "%",
                status: getStatus("Oxygen Level", data.spo2 || 0),
                icon: Droplets,
                lastUpdated: now.toLocaleString(),
              },
            ];
            onVitalsUpdate?.(formatted);
          } else {
            // Device is offline, show last checked vitals data
            setVitals(lastVitalsData);
            // Send formatted array with last vitals data for offline state
            if (lastVitalsData) {
              const offlineFormatted = [
                {
                  name: "Blood Pressure",
                  value: `${lastVitalsData.sbp}/${lastVitalsData.dbp}`,
                  unit: "mmHg",
                  status: getStatus("Blood Pressure", `${lastVitalsData.sbp}/${lastVitalsData.dbp}`),
                  icon: Heart,
                  lastUpdated: lastUpdatedTime ? lastUpdatedTime.toLocaleString() : "Device offline",
                },
                {
                  name: "Heart Rate",
                  value: lastVitalsData.bpm || 0,
                  unit: "bpm",
                  status: getStatus("Heart Rate", lastVitalsData.bpm || 0),
                  icon: Activity,
                  lastUpdated: lastUpdatedTime ? lastUpdatedTime.toLocaleString() : "Device offline",
                },
                {
                  name: "Temperature",
                  value: lastVitalsData.temp || 0,
                  unit: "°C",
                  status: getStatus("Temperature", lastVitalsData.temp || 0),
                  icon: Thermometer,
                  lastUpdated: lastUpdatedTime ? lastUpdatedTime.toLocaleString() : "Device offline",
                },
                {
                  name: "Oxygen Level",
                  value: lastVitalsData.spo2 || 0,
                  unit: "%",
                  status: getStatus("Oxygen Level", lastVitalsData.spo2 || 0),
                  icon: Droplets,
                  lastUpdated: lastUpdatedTime ? lastUpdatedTime.toLocaleString() : "Device offline",
                },
              ];
              onVitalsUpdate?.(offlineFormatted);
            }
          }
          onDeviceStatusUpdate?.(data.online);
        }
      } catch (err) {
        console.error("Error fetching vitals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVitals();
    const interval = setInterval(fetchVitals, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatus = (name: string, value: number | string): VitalStatus => {
    if (value === "-" || value === "-/-") return "normal";
    switch (name) {
      case "Blood Pressure": {
        const [sbp, dbp] = typeof value === "string" ? value.split("/").map(Number) : [0, 0];
        if (sbp < 90 || dbp < 60) return "low";
        if (sbp > 140 || dbp > 90) return "high";
        if (sbp >= 120 && sbp <= 139) return "slightly-high";
        return "normal";
      }
      case "Heart Rate": {
        if (Number(value) < 60) return "low";
        if (Number(value) > 100) return "high";
        return "normal";
      }
      case "Temperature": {
        if (Number(value) < 97) return "low";
        if (Number(value) > 100.4) return "slightly-high";
        if (Number(value) > 102) return "high";
        return "normal";
      }
      case "Oxygen Level": {
        if (Number(value) < 90) return "critical";
        if (Number(value) < 95) return "slightly-high";
        return "normal";
      }
      default:
        return "normal";
    }
  };

  // Even when vitals are null (loading), create placeholder cards
  const displayVitals = vitals || lastVitalsData;
  const baseVitals: Vital[] = [
    {
      name: "Blood Pressure",
      value: displayVitals ? `${displayVitals.sbp}/${displayVitals.dbp}` : "-/-",
      unit: "mmHg",
      status: displayVitals ? getStatus("Blood Pressure", `${displayVitals.sbp}/${displayVitals.dbp}`) : "normal",
      icon: Heart,
      lastUpdated: lastUpdatedTime ? lastUpdatedTime.toLocaleString() : "Loading...",
    },
    {
      name: "Heart Rate",
      value: displayVitals?.bpm ?? "-",
      unit: "bpm",
      status: displayVitals ? getStatus("Heart Rate", displayVitals.bpm || 0) : "normal",
      icon: Activity,
      lastUpdated: lastUpdatedTime ? lastUpdatedTime.toLocaleString() : "Loading...",
    },
    {
      name: "Temperature",
      value: displayVitals?.temp ?? "-",
      unit: "°C",
      status: displayVitals ? getStatus("Temperature", displayVitals.temp || 0) : "normal",
      icon: Thermometer,
      lastUpdated: lastUpdatedTime ? lastUpdatedTime.toLocaleString() : "Loading...",
    },
    {
      name: "Oxygen Level",
      value: displayVitals?.spo2 ?? "-",
      unit: "%",
      status: displayVitals ? getStatus("Oxygen Level", displayVitals.spo2 || 0) : "normal",
      icon: Droplets,
      lastUpdated: lastUpdatedTime ? lastUpdatedTime.toLocaleString() : "Loading...",
    },
  ];

  const premiumVitals: Vital[] = [
    {
      name: "EP Estimation",
      value: "85",
      unit: "ms",
      status: "normal",
      icon: Zap,
      lastUpdated: lastUpdatedTime ? lastUpdatedTime.toLocaleString() : "Loading...",
    },
    {
      name: "Ventricular Contraction",
      value: "120",
      unit: "bpm",
      status: "normal",
      icon: Heart,
      lastUpdated: lastUpdatedTime ? lastUpdatedTime.toLocaleString() : "Loading...",
    },
    {
      name: "Muscle Activity",
      value: "75",
      unit: "%",
      status: "normal",
      icon: Wind,
      lastUpdated: lastUpdatedTime ? lastUpdatedTime.toLocaleString() : "Loading...",
    },
  ];

  const liveVitals: Vital[] = baseVitals;

  const getStatusColor = (status: VitalStatus) => {
    switch (status) {
      case "normal":
        return "text-green-600 border-green-600 bg-green-100";
      case "low":
        return "text-blue-600 border-blue-600 bg-blue-100";
      case "slightly-high":
        return "text-yellow-600 border-yellow-600 bg-yellow-100";
      case "high":
        return "text-orange-600 border-orange-600 bg-orange-100";
      case "critical":
        return "text-red-600 border-red-600 bg-red-100";
      default:
        return "text-gray-600 border-gray-400 bg-gray-100";
    }
  };

  const getStatusLabel = (status: VitalStatus) => {
    switch (status) {
      case "normal":
        return "Normal";
      case "low":
        return "Low";
      case "slightly-high":
        return "Slightly High";
      case "high":
        return "High";
      case "critical":
        return "Critical";
      default:
        return "Unknown";
    }
  };

  return (
    <div>
      <div className="">
        <div className="w-full flex justify-between items-center mb-3"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {liveVitals.map((vital, index) => (
          <Card key={index} className="shadow-soft hover:shadow-medium transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <vital.icon
                  className={`h-6 w-6 ${
                    vital.status === "critical"
                      ? "text-red-600"
                      : vital.status === "high"
                      ? "text-orange-500"
                      : vital.status === "slightly-high"
                      ? "text-yellow-500"
                      : vital.status === "low"
                      ? "text-blue-500"
                      : "text-green-500"
                  }`}
                />
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(vital.status)}`}>
                  {getStatusLabel(vital.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium text-foreground mb-1">{vital.name}</h4>
              <div className="text-2xl font-bold text-foreground">
                {loading ? (
                  <span className="text-muted-foreground animate-pulse">--</span>
                ) : (
                  <>
                    {vital.value}
                    <span className="text-sm text-muted-foreground ml-1">{vital.unit}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{loading ? "Fetching data..." : `Updated ${vital.lastUpdated}`}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
