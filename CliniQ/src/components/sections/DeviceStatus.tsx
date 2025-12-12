import { cn } from "@/lib/utils";
import { Wifi, WifiOff } from "lucide-react";

interface DeviceStatusProps {
  connected: boolean;
}

export function DeviceStatus({ connected }: DeviceStatusProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium",
      connected 
        ? "border-status-normal/30 bg-status-normal/10 text-status-normal" 
        : "border-status-alert/30 bg-status-alert/10 text-status-alert"
    )}>
      <span className={cn(
        "h-2 w-2 rounded-full",
        connected ? "bg-status-normal animate-pulse-subtle" : "bg-status-alert"
      )} />
      {connected ? (
        <>
          <Wifi className="h-4 w-4" />
          Device Connected
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          Device not connected
        </>
      )}
    </div>
  );
}
