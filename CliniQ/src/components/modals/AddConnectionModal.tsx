import { useState, useEffect, useCallback } from "react";
import { UserPlus, Search, Shield, Check, User, Mail, Loader2, AlertCircle, Info, UserCheck, UserX } from "lucide-react";
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

interface SearchedUser {
  username: string;
  email: string;
  first_name: string;
  surname: string;
  age: string;
  gender: string;
  premium_plan: string;
  exists: boolean;
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
  const [searching, setSearching] = useState(false);
  const [searchedUser, setSearchedUser] = useState<SearchedUser | null>(null);
  const [searchError, setSearchError] = useState<string>("");

  useEffect(() => {
    if (!open) {
      setStep(1);
      setSearchQuery("");
      setSelectedPermissions(["vitalSigns", "dietData"]);
      setSearchedUser(null);
      setSearchError("");
    }
  }, [open]);

  const searchUser = useCallback(async (username: string) => {
    if (!username.trim() || username.length < 2) {
      setSearchedUser(null);
      setSearchError("");
      return;
    }

    setSearching(true);
    setSearchError("");

    try {
      const currentUser = JSON.parse(localStorage.getItem("cliniq_user") || "{}");

      if (username.trim().toLowerCase() === currentUser.username?.toLowerCase()) {
        setSearchedUser({
          username: username.trim(),
          email: currentUser.email || "",
          first_name: currentUser.first_name || "",
          surname: currentUser.surname || "",
          age: currentUser.age || "",
          gender: currentUser.gender || "",
          premium_plan: currentUser.premium_plan || "standard",
          exists: true,
        });
        setSearchError("This is your own profile");
        return;
      }

      const userData = await apiClient.getUserProfile(username.trim());
      console.log("User found:", userData);

      setSearchedUser({
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        surname: userData.surname,
        age: userData.age,
        gender: userData.gender,
        premium_plan: userData.premium_plan || "standard",
        exists: true,
      });
    } catch (error: any) {
      console.log("User search error:", error);

      if (error.message?.includes("not found") || error.message?.includes("404")) {
        setSearchedUser({
          username: username.trim(),
          email: "",
          first_name: "",
          surname: "",
          age: "",
          gender: "",
          premium_plan: "standard",
          exists: false,
        });
        setSearchError(`User "${username.trim()}" not found. Please check the username.`);
      } else if (error.message?.includes("network") || error.message?.includes("Network")) {
        setSearchError("Network error. Please check your connection.");
      } else {
        setSearchError("User not found or profile not accessible.");
      }
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUser(searchQuery.trim());
      } else {
        setSearchedUser(null);
        setSearchError("");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUser]);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    } else {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== permissionId));
    }
  };

  const handleSendRequest = async () => {
    if (!searchedUser || !searchedUser.exists) {
      toast({
        title: "Error",
        description: "Please search and select a valid user first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem("cliniq_user") || "{}");
      if (!currentUser.username) {
        throw new Error("You need to be logged in to send a connection request");
      }

      if (searchedUser.username.toLowerCase() === currentUser.username.toLowerCase()) {
        throw new Error("You cannot send a connection request to yourself");
      }

      console.log("Sending connection request...");

      // Try the standard way
      const requestData = {
        monitored: searchedUser.username, // The person you want to monitor
        monitored_by: currentUser.username, // Your username
      };

      console.log("Request data:", requestData);

      const response = await apiClient.createConnection(requestData);
      console.log("API Response:", response);

      if (response.success) {
        toast({
          title: "Request sent successfully!",
          description: `Connection request sent to ${searchedUser.first_name} ${searchedUser.surname}. They'll see it in their Pending Requests.`,
        });

        onOpenChange(false);

        // Refresh after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(response.message || "Failed to send connection request");
      }
    } catch (error: any) {
      console.error("Send request error:", error);

      // Show user-friendly error messages
      let errorMessage = "Failed to send connection request";
      const errorStr = error.message || "";

      if (errorStr.includes("cannot send") || errorStr.includes("yourself")) {
        errorMessage = "You cannot send a connection request to yourself";
      } else if (errorStr.includes("already") || errorStr.includes("exist") || errorStr.includes("duplicate")) {
        errorMessage = "A connection request already exists for this user";
      } else if (errorStr.includes("not found") || errorStr.includes("does not exist")) {
        errorMessage = "User not found. Please check the username and try again";
      } else if (errorStr.includes("Network") || errorStr.includes("network")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (errorStr.includes("Backend validation")) {
        errorMessage = "The user might not exist or there might be an issue with the connection. Please try again.";
      } else {
        errorMessage = errorStr;
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
      setStep(1);
      setSearchQuery("");
      setSelectedPermissions(["vitalSigns", "dietData"]);
      setSearchedUser(null);
      setSearchError("");
    }
    onOpenChange(newOpen);
  };

  const handleContinue = () => {
    if (searchedUser && searchedUser.exists && !isCurrentUser()) {
      setStep(2);
    }
  };

  const isCurrentUser = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("cliniq_user") || "{}");
      return searchedUser?.username.toLowerCase() === currentUser.username?.toLowerCase();
    } catch {
      return false;
    }
  };

  const getUserInitials = (user: SearchedUser) => {
    if (user.first_name && user.surname) {
      return `${user.first_name.charAt(0)}${user.surname.charAt(0)}`.toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  const formatAge = (age: string) => {
    return age ? `${age} years` : "Not specified";
  };

  const formatPremiumPlan = (plan: string) => {
    return plan === "premium" ? "Premium User" : "Standard User";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Connection
          </DialogTitle>
          <DialogDescription>Search for a user and send a connection request to monitor their health data</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search by Username</Label>
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
                {searching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
              </div>
              <p className="text-xs text-muted-foreground">Enter at least 2 characters to search</p>
            </div>

            {searchedUser && (
              <div className={`rounded-lg border p-4 ${searchedUser.exists ? "border-border" : "border-destructive"}`}>
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      searchedUser.exists ? "bg-primary/10" : "bg-destructive/10"
                    }`}
                  >
                    {searchedUser.exists ? <UserCheck className="h-6 w-6 text-primary" /> : <UserX className="h-6 w-6 text-destructive" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">
                        {searchedUser.exists ? `${searchedUser.first_name} ${searchedUser.surname}` : searchedUser.username}
                      </h3>
                      {searchedUser.exists && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            searchedUser.premium_plan === "premium" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {formatPremiumPlan(searchedUser.premium_plan)}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">Username</p>
                        <p className="text-muted-foreground">{searchedUser.username}</p>
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground truncate">{searchedUser.email || "Not available"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Age</p>
                        <p className="text-muted-foreground">{formatAge(searchedUser.age)}</p>
                      </div>
                      <div>
                        <p className="font-medium">Gender</p>
                        <p className="text-muted-foreground capitalize">{searchedUser.gender || "Not specified"}</p>
                      </div>
                    </div>

                    {!searchedUser.exists && searchError && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{searchError}</span>
                      </div>
                    )}

                    {isCurrentUser() && searchedUser.exists && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>This is your own profile. You cannot send a connection request to yourself.</span>
                      </div>
                    )}

                    {searchedUser.exists && !isCurrentUser() && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                        <UserCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>User found! You can send a connection request to this user.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-800">Search Tips:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Enter the exact username of the person you want to monitor</li>
                    <li>• Usernames are case-sensitive</li>
                    <li>• The user must have an active account in the system</li>
                    <li>• You can only send requests to users who exist</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && searchedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-heading text-lg font-semibold text-primary">
                {getUserInitials(searchedUser)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">
                    {searchedUser.first_name} {searchedUser.surname}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      searchedUser.premium_plan === "premium" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {formatPremiumPlan(searchedUser.premium_plan)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  @{searchedUser.username} • {searchedUser.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchedUser.gender && `${searchedUser.gender}, `}
                  {formatAge(searchedUser.age)}
                </p>
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
                <span className="font-medium">How it works:</span> This sends a request to {searchedUser.first_name}. They'll see your request in
                their Network page and can choose to accept or deny it. You'll only see their data if they accept.
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground">Request Summary:</p>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>
                    Target user:{" "}
                    <span className="font-medium">
                      {searchedUser.first_name} {searchedUser.surname}
                    </span>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span>
                    Email: <span className="font-medium">{searchedUser.email}</span>
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
            disabled={step === 1 ? !searchedUser || !searchedUser.exists || isCurrentUser() : loading}
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
