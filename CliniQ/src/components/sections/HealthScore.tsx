import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HealthScoreProps {
  score: "Good" | "Fair" | "Poor";
  lastUpdated: string;
}

const scoreStyles = {
  Good: "text-status-normal",
  Fair: "text-status-warning",
  Poor: "text-status-alert",
};

export function HealthScore({ score, lastUpdated }: HealthScoreProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-right"
    >
      <p className="text-xs text-muted-foreground">Health Score</p>
      <p className={cn("font-heading text-3xl font-bold", scoreStyles[score])}>
        {score}
      </p>
      <p className="text-xs text-muted-foreground">{lastUpdated}</p>
    </motion.div>
  );
}
