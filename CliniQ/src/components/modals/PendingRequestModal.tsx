import { useState } from "react";
import { User, Shield, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PendingRequest {
  id: number;
  name: string;
  relation: string;
  avatar: string;
  requestType: string;
  requestedData: string[];
}

interface PendingRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: PendingRequest | null;
  onAccept: (id: number, selectedPermissions: string[]) => void;
  onDeny: (id: number) => void;
}

export function PendingRequestModal({ open, onOpenChange, request, onAccept, onDeny }: PendingRequestModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedPermissions([]);
    }
    onOpenChange(newOpen);
  };

  const handleAccept = () => {
    if (request) {
      onAccept(request.id, selectedPermissions);
      handleOpenChange(false);
    }
  };

  const handleDeny = () => {
    if (request) {
      onDeny(request.id);
      handleOpenChange(false);
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) => (prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]));
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <User className="h-5 w-5 text-primary" />
            Review Connection Request
          </DialogTitle>
          <DialogDescription>Review the details and select which health data to grant access to.</DialogDescription>
        </DialogHeader>

        {/* User Profile */}
        <div className="flex items-center gap-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-heading text-xl font-semibold text-primary">
            {request.avatar}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{request.name}</p>
            <p className="text-sm text-muted-foreground">{request.requestType}</p>
          </div>
        </div>

        {/* Requested Permissions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <Shield className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">Select which health data to grant access to:</p>
          </div>

          <div className="space-y-3">
            {request.requestedData.map((permission) => (
              <label
                key={permission}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <span className="font-medium text-foreground">{permission}</span>
                <Checkbox checked={selectedPermissions.includes(permission)} onCheckedChange={() => togglePermission(permission)} />
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={handleDeny} className="flex-1">
            <X className="mr-2 h-4 w-4" />
            Deny Request
          </Button>
          <Button onClick={handleAccept} className="flex-1" disabled={selectedPermissions.length === 0}>
            <Check className="mr-2 h-4 w-4" />
            Accept Selected
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
