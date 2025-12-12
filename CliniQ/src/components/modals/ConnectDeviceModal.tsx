import { useState } from "react";
import { Link2, Bluetooth, Wifi, Smartphone, Watch, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ConnectDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const devices = [
  { id: "smartwatch", name: "Smart Watch", icon: Watch, description: "Apple Watch, Samsung Galaxy Watch, etc." },
  { id: "fitness", name: "Fitness Tracker", icon: Activity, description: "Fitbit, Garmin, Mi Band, etc." },
  { id: "phone", name: "Smartphone", icon: Smartphone, description: "Use your phone's health sensors" },
];

export function ConnectDeviceModal({ open, onOpenChange }: ConnectDeviceModalProps) {
  const { toast } = useToast();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState<string[]>([]);

  const handleScan = () => {
    setIsScanning(true);
    setFoundDevices([]);

    // Simulate device scanning
    setTimeout(() => {
      setFoundDevices(["CliniQ Band Pro", "Apple Watch Series 9", "Fitbit Charge 5"]);
      setIsScanning(false);
    }, 2000);
  };

  const handleConnect = (device: string) => {
    toast({
      title: "Device connected!",
      description: `${device} has been successfully connected to your account.`,
    });
    onOpenChange(false);
    setSelectedDevice(null);
    setFoundDevices([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Link2 className="h-5 w-5 text-primary" />
            Connect Device
          </DialogTitle>
          <DialogDescription>Connect a health monitoring device to sync your vitals automatically</DialogDescription>
        </DialogHeader>

        {!selectedDevice ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select your device type:</p>
            {devices.map((device) => (
              <button
                key={device.id}
                onClick={() => setSelectedDevice(device.id)}
                className="flex w-full items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <device.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{device.name}</p>
                  <p className="text-sm text-muted-foreground">{device.description}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connection Methods */}
            <div className="flex gap-3">
              <button className="flex flex-1 flex-col items-center gap-2 rounded-lg border border-primary bg-primary/5 p-4">
                <Bluetooth className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-primary">Bluetooth</span>
              </button>
              <button className="flex flex-1 flex-col items-center gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted">
                <Wifi className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Wi-Fi</span>
              </button>
            </div>

            {/* Scan Button */}
            <Button onClick={handleScan} disabled={isScanning} className="w-full gap-2">
              <RefreshCw className={cn("h-4 w-4", isScanning && "animate-spin")} />
              {isScanning ? "Scanning..." : "Scan for Devices"}
            </Button>

            {/* Found Devices */}
            {foundDevices.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Found devices:</p>
                {foundDevices.map((device) => (
                  <button
                    key={device}
                    onClick={() => handleConnect(device)}
                    className="flex w-full items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-status-normal animate-pulse" />
                      <span className="font-medium text-foreground">{device}</span>
                    </div>
                    <span className="text-sm text-primary">Connect</span>
                  </button>
                ))}
              </div>
            )}

            <Button variant="outline" onClick={() => setSelectedDevice(null)} className="w-full">
              Back to Device Types
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
