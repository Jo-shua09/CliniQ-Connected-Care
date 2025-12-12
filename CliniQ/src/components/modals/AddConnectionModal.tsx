import { useState, useEffect } from "react";
import { UserPlus, Search, Shield, Check, User, Mail, Loader2, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

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
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["vitalSigns", "dietData"]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Reset when modal opens/closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setSearchQuery("");
      setSelectedPermissions(["vitalSigns", "dietData"]);
    }
  }, [open]);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    } else {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== permissionId));
    }
  };

  const handleSendRequest = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem("cliniq_user") || "{}");
      if (!currentUser.username) {
        throw new Error("You need to be logged in to send a connection request");
      }

      // Prevent sending request to yourself
      if (searchQuery.trim().toLowerCase() === currentUser.username.toLowerCase()) {
        throw new Error("You cannot send a connection request to yourself");
      }

      // Prepare data for /create_connection endpoint
      const requestData = {
        monitored: searchQuery.trim(), // The person you want to monitor
        monitored_by: currentUser.username, // Your username
      };

      console.log("Sending connection request:", requestData);

      // Test the API call first
      const testUrl = `http://cliniq2.pythonanywhere.com/create_connection?monitored=${encodeURIComponent(
        searchQuery.trim()
      )}&monitored_by=${encodeURIComponent(currentUser.username)}`;
      console.log("API URL:", testUrl);

      const response = await apiClient.createConnection(requestData);
      console.log("API Response:", response);

      if (response.success) {
        toast({
          title: "Request sent successfully!",
          description: `Connection request sent to ${searchQuery.trim()}. They'll see it in their Pending Requests.`,
        });

        // Reset and close
        onOpenChange(false);

        // Refresh the page after 1 second to show updated connections
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Try to get more details about the failure
        try {
          const directResponse = await fetch(testUrl);
          const detailedData = await directResponse.json();
          console.log("Detailed error response:", detailedData);

          if (detailedData.error || detailedData.message) {
            throw new Error(detailedData.error || detailedData.message || "Failed to send request");
          } else {
            throw new Error("Request failed. The user may not exist or there might be a duplicate request.");
          }
        } catch (fetchError) {
          throw new Error("Failed to send connection request. Please check if the username is correct.");
        }
      }
    } catch (error: any) {
      console.error("Send request error:", error);

      let errorMessage = "Failed to send connection request";
      if (error.message.includes("cannot send")) {
        errorMessage = error.message;
      } else if (error.message.includes("already exists") || error.message.includes("duplicate")) {
        errorMessage = "Connection request already exists or you're already connected to this user";
      } else if (error.message.includes("not found") || error.message.includes("does not exist")) {
        errorMessage = "User not found. Please check the username is correct.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Request failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset everything when closing
      setStep(1);
      setSearchQuery("");
      setSelectedPermissions(["vitalSigns", "dietData"]);
    }
    onOpenChange(newOpen);
  };

  const handleContinue = () => {
    if (searchQuery.trim().length >= 2) {
      setStep(2);
    }
  };

  // Check if it's the current user
  const isCurrentUser = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("cliniq_user") || "{}");
      return searchQuery.trim().toLowerCase() === currentUser.username?.toLowerCase();
    } catch {
      return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Connection
          </DialogTitle>
          <DialogDescription>Send a request to monitor another user's health data</DialogDescription>
        </DialogHeader>

        {/* Step 1: Search */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Enter Username to Monitor</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Enter exact username..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={loading}
                />
              </div>

              {isCurrentUser() && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>You cannot send a connection request to yourself.</span>
                </div>
              )}

              <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">How to find usernames:</p>
                  <ul className="space-y-1">
                    <li>• Ask the person for their exact username</li>
                    <li>• Usernames are case-sensitive</li>
                    <li>• Example: "James2021" not "james2021"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Confirm Request */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-heading text-lg font-semibold text-primary">
                {searchQuery.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-foreground">{searchQuery}</p>
                <p className="text-sm text-muted-foreground">Username</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Select data you want to monitor:</Label>
              <div className="space-y-2">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                      disabled={loading}
                    />
                    <Label htmlFor={permission.id} className="text-sm font-normal cursor-pointer">
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-800">
                <span className="font-medium">How it works:</span> This sends a request to {searchQuery}. They'll see your request in their Network
                page and can choose to accept or deny it.
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground">Request Summary:</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>
                    Target user: <span className="font-medium">{searchQuery}</span>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3" />
                  <span>
                    Data requested:{" "}
                    <span className="font-medium">{selectedPermissions.map((p) => permissions.find((perm) => perm.id === p)?.label).join(", ")}</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {step === 2 && (
            <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={loading}>
              Back
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={step === 1 ? handleContinue : handleSendRequest}
            disabled={step === 1 ? searchQuery.length < 2 || isCurrentUser() : loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Request...
              </>
            ) : step === 1 ? (
              "Continue to Review"
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Send Connection Request
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
