import { useState } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ConnectDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectDeviceModal({ open, onOpenChange }: ConnectDeviceModalProps) {
  const { toast } = useToast();
  const [deviceId, setDeviceId] = useState("");

  const handleConnect = () => {
    if (!deviceId.trim()) {
      toast({
        title: "Device ID required",
        description: "Please enter a valid device ID to connect.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Device connected!",
      description: `Device with ID "${deviceId}" has been successfully connected to your account.`,
    });
    onOpenChange(false);
    setDeviceId("");
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
            <Input id="deviceId" placeholder="Enter device ID" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} />
          </div>

          <Button onClick={handleConnect} className="w-full">
            Connect Device
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
