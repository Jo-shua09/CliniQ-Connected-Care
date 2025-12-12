import { useState } from "react";
import { X, Activity, Droplets, Thermometer, Wind, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface LogVitalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogVitalsModal({ open, onOpenChange }: LogVitalsModalProps) {
  const { toast } = useToast();
  const [vitals, setVitals] = useState({
    systolic: 120,
    diastolic: 80,
    heartRate: 72,
    temperature: 36.6,
    oxygen: 98,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Vitals logged successfully",
      description: "Your health metrics have been recorded.",
    });
    onOpenChange(false);
  };

  const adjustValue = (field: keyof typeof vitals, delta: number) => {
    setVitals((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] + delta),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Activity className="h-5 w-5 text-primary" />
            Log Vitals
          </DialogTitle>
          <DialogDescription>
            Manually enter your current health readings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Blood Pressure */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-vital-pressure" />
              Blood Pressure (mmHg)
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-muted/50 p-2">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => adjustValue("systolic", -1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={vitals.systolic}
                  onChange={(e) => setVitals({ ...vitals, systolic: parseInt(e.target.value) || 0 })}
                  className="h-8 border-0 bg-transparent text-center font-heading text-lg"
                />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => adjustValue("systolic", 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-muted-foreground">/</span>
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-muted/50 p-2">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => adjustValue("diastolic", -1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={vitals.diastolic}
                  onChange={(e) => setVitals({ ...vitals, diastolic: parseInt(e.target.value) || 0 })}
                  className="h-8 border-0 bg-transparent text-center font-heading text-lg"
                />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => adjustValue("diastolic", 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Heart Rate */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-vital-heart" />
              Heart Rate (bpm)
            </Label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-2">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => adjustValue("heartRate", -1)}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={vitals.heartRate}
                onChange={(e) => setVitals({ ...vitals, heartRate: parseInt(e.target.value) || 0 })}
                className="h-8 border-0 bg-transparent text-center font-heading text-lg"
              />
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => adjustValue("heartRate", 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-vital-temperature" />
              Temperature (°C)
            </Label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-2">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => adjustValue("temperature", -0.1)}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                step="0.1"
                value={vitals.temperature.toFixed(1)}
                onChange={(e) => setVitals({ ...vitals, temperature: parseFloat(e.target.value) || 0 })}
                className="h-8 border-0 bg-transparent text-center font-heading text-lg"
              />
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => adjustValue("temperature", 0.1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Oxygen */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-vital-oxygen" />
              Oxygen Level (%)
            </Label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-2">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => adjustValue("oxygen", -1)}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={vitals.oxygen}
                onChange={(e) => setVitals({ ...vitals, oxygen: parseInt(e.target.value) || 0 })}
                className="h-8 border-0 bg-transparent text-center font-heading text-lg"
              />
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => adjustValue("oxygen", 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Vitals
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
