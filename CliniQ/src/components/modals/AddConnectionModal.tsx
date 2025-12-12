import { useState } from "react";
import { UserPlus, Search, Clock, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const permissions = [
  { id: "vitalSigns", label: "Vital Signs" },
  { id: "dietData", label: "Diet Data" },
];

export function AddConnectionModal({ open, onOpenChange }: AddConnectionModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSendRequest = () => {
    toast({
      title: "Request sent!",
      description: "Your connection request has been sent successfully.",
    });
    onOpenChange(false);
    setStep(1);
    setSearchQuery("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep(1);
      setSearchQuery("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Connection
          </DialogTitle>
          <DialogDescription>Search for someone to connect with</DialogDescription>
        </DialogHeader>

        {/* Step 1: Search */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or email..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          {searchQuery && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Results:</p>
              <button
                onClick={() => setStep(2)}
                className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-heading font-semibold text-primary">
                  {searchQuery.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{searchQuery}</p>
                  <p className="text-sm text-muted-foreground">{searchQuery.toLowerCase()}@email.com</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Confirm Request */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              <Shield className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">This will send a request to monitor both Vital Signs and Diet Data</p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground">Request Summary:</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Person: {searchQuery}</li>
                <li>• Data requested: Vital Signs, Diet Data</li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {step === 2 && (
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
          )}
          <Button className="flex-1" onClick={step === 1 ? () => setStep(2) : handleSendRequest} disabled={!searchQuery}>
            {step === 1 ? (
              "Continue"
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Send Request
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
