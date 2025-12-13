import { cn } from "@/lib/utils";
import { Wifi, WifiOff } from "lucide-react";

interface DeviceStatusProps {
  connected: boolean;
  online?: boolean;
}

export function DeviceStatus({ connected, online = false }: DeviceStatusProps) {
  const getStatusDisplay = () => {
    if (!connected) {
      return {
        text: "Device not connected",
        icon: <WifiOff className="h-4 w-4" />,
        color: "border-status-alert/30 bg-status-alert/10 text-status-alert",
        dotColor: "bg-status-alert",
      };
    }

    if (online) {
      return {
        text: "Device Online",
        icon: <Wifi className="h-4 w-4" />,
        color: "border-status-normal/30 bg-status-normal/10 text-status-normal",
        dotColor: "bg-status-normal animate-pulse-subtle",
      };
    }

    return {
      text: "Device Connected (Offline)",
      icon: <Wifi className="h-4 w-4 opacity-50" />,
      color: "border-yellow-500/30 bg-yellow-500/10 text-yellow-600",
      dotColor: "bg-yellow-500",
    };
  };

  const status = getStatusDisplay();

  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium", status.color)}>
      <span className={cn("h-2 w-2 rounded-full", status.dotColor)} />
      {status.icon}
      {status.text}
    </div>
  );
}
