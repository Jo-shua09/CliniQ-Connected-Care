import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export type VitalStatus = "normal" | "warning" | "alert" | "low";

interface VitalCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit: string;
  status: VitalStatus;
  statusLabel: string;
  lastUpdated: string;
  color: "heart" | "oxygen" | "temperature" | "pressure";
  delay?: number;
}

const statusStyles: Record<VitalStatus, string> = {
  normal: "status-normal",
  warning: "status-warning",
  alert: "status-alert",
  low: "status-low",
};

const iconColors: Record<string, string> = {
  heart: "text-vital-heart",
  oxygen: "text-vital-oxygen",
  temperature: "text-vital-temperature",
  pressure: "text-vital-pressure",
};

export function VitalCard({
  icon: Icon,
  label,
  value,
  unit,
  status,
  statusLabel,
  lastUpdated,
  color,
  delay = 0,
}: VitalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      className="card-hover rounded-xl border border-border bg-card p-5 shadow-card"
    >
      <div className="flex items-start justify-between">
        <div className={cn("rounded-lg p-2", `bg-${color === 'heart' ? 'vital-heart' : color === 'oxygen' ? 'vital-oxygen' : color === 'temperature' ? 'vital-temperature' : 'vital-pressure'}/10`)}>
          <Icon className={cn("h-5 w-5", iconColors[color])} />
        </div>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyles[status])}>
          {statusLabel}
        </span>
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="font-heading text-3xl font-bold text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>
      
      <p className="mt-3 text-xs text-muted-foreground">Updated {lastUpdated}</p>
    </motion.div>
  );
}
