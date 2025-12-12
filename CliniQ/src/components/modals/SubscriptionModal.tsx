import { Check, Crown, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "../ui/button";

interface SubscriptionModalProps {
  open: boolean;
  onSelect: (plan: "standard" | "premium") => void;
}

const plans = [
  {
    id: "standard" as const,
    name: "Standard",
    icon: Zap,
    price: "Free",
    description: "Essential health monitoring for everyday wellness",
    features: [
      "Heart Rate monitoring",
      "Oxygen Level tracking",
      "Blood Sugar readings",
      "Temperature monitoring",
      "Network access",
      "AI Health Assistant",
    ],
  },
  {
    id: "premium" as const,
    name: "premium",
    icon: Crown,
    price: "$9.99/mo",
    description: "Advanced metrics for comprehensive health insights",
    features: ["Everything in Standard", "EP Estimation", "Ventricular Contraction", "Muscle Activity", "Advanced analytics", "Priority support"],
    popular: true,
  },
];

export default function SubscriptionModal({ open, onSelect }: SubscriptionModalProps) {
  const [selected, setSelected] = useState<"standard" | "premium">("standard");

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden" hideCloseButton>
        <div className="gradient-hero p-6 text-primary-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading text-primary-foreground">Choose Your Plan</DialogTitle>
            <DialogDescription className="text-primary-foreground/80">Select the dashboard that fits your health monitoring needs</DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {plans.map((plan) => (
              <motion.button
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(plan.id)}
                className={`relative flex flex-col rounded-xl border-2 p-5 text-left transition-all ${
                  selected === plan.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-4 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    Popular
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${plan.id === "premium" ? "bg-secondary/20" : "bg-primary/10"}`}
                  >
                    <plan.icon className={`h-5 w-5 ${plan.id === "premium" ? "text-secondary" : "text-primary"}`} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-sm font-medium text-primary">{plan.price}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {selected === plan.id && (
                  <motion.div
                    layoutId="plan-selected"
                    className="absolute inset-0 rounded-xl border-2 border-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          <Button onClick={() => onSelect(selected)} className="mt-6 w-full" size="lg">
            Continue with {selected === "premium" ? "premium" : "Standard"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
