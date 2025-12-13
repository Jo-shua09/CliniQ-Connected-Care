import { useState } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface ConnectDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeviceConnected?: () => void;
}

export function ConnectDeviceModal({ open, onOpenChange, onDeviceConnected }: ConnectDeviceModalProps) {
  const { toast } = useToast();
  const [deviceId, setDeviceId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!deviceId.trim()) {
      toast({
        title: "Device ID required",
        description: "Please enter a valid device ID to connect.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Get current user from localStorage
      const storedUser = localStorage.getItem("cliniq_user");
      if (!storedUser) {
        toast({
          title: "User not found",
          description: "Please login again to connect a device.",
          variant: "destructive",
        });
        return;
      }

      const user = JSON.parse(storedUser);

      // Call API to set device ID
      const response = await apiClient.setDeviceId({
        username: user.username,
        device_id: deviceId.trim(),
      });

      if (response.success) {
        toast({
          title: "Device connected!",
          description: `Device with ID "${deviceId}" has been successfully connected to your account.`,
        });

        // Update local storage to indicate device is connected
        const updatedUser = { ...user, device_id: deviceId.trim() };
        localStorage.setItem("cliniq_user", JSON.stringify(updatedUser));

        // Call the callback if provided
        if (onDeviceConnected) {
          onDeviceConnected();
        }

        onOpenChange(false);
        setDeviceId("");
      } else {
        toast({
          title: "Connection failed",
          description: "Unable to connect device. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Device connection error:", error);
      toast({
        title: "Connection error",
        description: "An error occurred while connecting the device. Please check the device ID and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Link2 className="h-5 w-5 text-primary" />
            Connect Device
          </DialogTitle>
          <DialogDescription>Enter the device ID to connect your health monitoring device</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deviceId">Device ID</Label>
            <Input id="deviceId" placeholder="Enter device ID" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} disabled={loading} />
          </div>

          <Button onClick={handleConnect} className="w-full" disabled={loading}>
            {loading ? "Connecting..." : "Connect Device"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
