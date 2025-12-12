import { User, Mail, Phone, Calendar, Activity, Thermometer, Heart, Droplets, Target } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: {
    id: number;
    name: string;
    email: string;
    gender: string;
    contact: string;
    avatar: string;
    lastUpdate: string;
    status: string;
    vitalSigns: {
      heartRate: number;
      oxygenLevel: number;
      bloodSugar: number;
      temperature: number;
    };
    dietData?: Record<string, unknown>;
  } | null;
}

export function UserProfileModal({ open, onOpenChange, person }: UserProfileModalProps) {
  if (!person) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-heading text-lg font-semibold text-primary">
              {person.avatar}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{person.name}</h2>
              <Badge variant={person.status === "normal" ? "default" : "destructive"} className="mt-1">
                {person.status === "normal" ? "Normal" : "Warning"}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>Last updated: {person.lastUpdate}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Gender</p>
                <p className="text-sm text-muted-foreground">{person.gender}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">{person.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Contact</p>
                <p className="text-sm text-muted-foreground">{person.contact}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Last Update</p>
                <p className="text-sm text-muted-foreground">{person.lastUpdate}</p>
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          {person.vitalSigns && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Vital Signs
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Heart className={cn("h-5 w-5", person.status === "normal" ? "text-red-500" : "text-red-600")} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{person.vitalSigns.heartRate} bpm</p>
                    <p className="text-xs text-muted-foreground">Heart Rate</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Droplets className={cn("h-5 w-5", person.status === "normal" ? "text-blue-500" : "text-blue-600")} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{person.vitalSigns.oxygenLevel}%</p>
                    <p className="text-xs text-muted-foreground">Oxygen Level</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Target className={cn("h-5 w-5", person.status === "normal" ? "text-green-500" : "text-green-600")} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{person.vitalSigns.bloodSugar} mg/dL</p>
                    <p className="text-xs text-muted-foreground">Blood Sugar</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Thermometer className={cn("h-5 w-5", person.status === "normal" ? "text-orange-500" : "text-orange-600")} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{person.vitalSigns.temperature}°F</p>
                    <p className="text-xs text-muted-foreground">Temperature</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Diet Data */}
          {person.dietData && Object.keys(person.dietData).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Diet Data</h3>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Diet information will be displayed here</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
