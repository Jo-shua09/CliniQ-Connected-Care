import { Brain, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface AIAssistantProps {
  status: "good" | "attention";
  message: string;
}

export function AIAssistant({ status, message }: AIAssistantProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-xl border border-border bg-card p-5 shadow-card"
    >
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="font-heading text-lg font-semibold text-foreground">AI Health Assistant</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Personalized recommendations based on your latest vitals
      </p>
      
      <div className="mt-4 rounded-lg bg-muted/50 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-status-normal/15 p-2">
            <CheckCircle className="h-5 w-5 text-status-normal" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              All Good! <span className="ml-2 rounded-full bg-status-normal/15 px-2 py-0.5 text-xs text-status-normal">low</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      </div>
      
      <Link to="/chat">
        <Button className="mt-4 w-full" size="lg">
          Ask about my health
        </Button>
      </Link>
    </motion.div>
  );
}
