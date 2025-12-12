import { useState } from "react";
import { User, Shield, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MonitoringPerson {
  id: number;
  name: string;
  email: string;
  gender: string;
  contact: string;
  avatar: string;
  permissions: string[];
}

interface EditPermissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: MonitoringPerson | null;
  onSave: (id: number, permissions: string[]) => void;
}

const availablePermissions = [
  { id: "vitalSigns", label: "Vital Signs" },
  { id: "dietData", label: "Diet Data" },
];

export function EditPermissionsModal({ open, onOpenChange, person, onSave }: EditPermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(person?.permissions || []);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedPermissions(person?.permissions || []);
    }
    onOpenChange(newOpen);
  };

  const handleSave = () => {
    if (person) {
      onSave(person.id, selectedPermissions);
      handleOpenChange(false);
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) => (prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]));
  };

  if (!person) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <User className="h-5 w-5 text-primary" />
            Edit Permissions
          </DialogTitle>
          <DialogDescription>Modify what health data {person.name} can access.</DialogDescription>
        </DialogHeader>

        {/* User Profile */}
        <div className="flex items-center gap-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-heading text-xl font-semibold text-primary">
            {person.avatar}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{person.name}</p>
            <p className="text-sm text-muted-foreground">Currently monitoring your health data</p>
          </div>
        </div>

        {/* Current Permissions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <Shield className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">Select which health data to allow access to:</p>
          </div>

          <div className="space-y-3">
            {availablePermissions.map((permission) => (
              <label
                key={permission.id}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <span className="font-medium text-foreground">{permission.label}</span>
                <Checkbox checked={selectedPermissions.includes(permission.label)} onCheckedChange={() => togglePermission(permission.label)} />
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)} className="flex-1">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
