import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AddConnectionModal } from "@/components/modals/AddConnectionModal";
import { PendingRequestModal } from "@/components/modals/PendingRequestModal";
import { UserProfileModal } from "@/components/modals/UserProfileModal";
import { EditPermissionsModal } from "@/components/modals/EditPermissionsModal";
import { motion } from "framer-motion";
import { Users, UserPlus, Eye, Clock, Check, X, MoreVertical, Search, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiClient, PendingRequest } from "@/lib/api";

// Types for UI
interface MonitoringPerson {
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
  dietData: Record<string, unknown>;
}

interface MonitoringMePerson {
  id: number;
  name: string;
  email: string;
  gender: string;
  contact: string;
  avatar: string;
  permissions: string[];
}

interface ConnectionUser {
  username: string;
  email: string;
  id: number;
  accepted?: boolean;
}

interface GetConnectionsResponse {
  monitoring?: ConnectionUser[];
  monitored_by?: ConnectionUser[];
  pending_requests?: PendingRequest[];
}

export default function Network() {
  const { toast } = useToast();
  const [addConnectionOpen, setAddConnectionOpen] = useState(false);
  const [pendingRequestModalOpen, setPendingRequestModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<MonitoringPerson | null>(null);
  const [editPermissionsModalOpen, setEditPermissionsModalOpen] = useState(false);
  const [selectedMonitoringPerson, setSelectedMonitoringPerson] = useState<MonitoringMePerson | null>(null);
  const [monitoringPeople, setMonitoringPeople] = useState<MonitoringPerson[]>([]);
  const [monitoringMe, setMonitoringMe] = useState<MonitoringMePerson[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("cliniq_user") || "{}");
        if (!user.username) {
          console.warn("No username found in localStorage");
          setLoading(false);
          return;
        }

        console.log("Fetching connections for username:", user.username);
        const response: GetConnectionsResponse = await apiClient.getConnections(user.username);
        console.log("Connections response:", response);

        // Use monitoring instead of monitored (based on your API response)
        const monitoringArray = response.monitoring || response.monitored || [];
        const monitoredByArray = response.monitored_by || [];

        // Filter out pending requests (accepted: false) from monitoring list
        const mappedMonitoringPeople: MonitoringPerson[] = monitoringArray
          .filter((person: ConnectionUser) => person.accepted !== false) // Only show accepted or undefined
          .map((person) => ({
            id: person.id,
            name: person.username,
            email: person.email,
            gender: "Unknown",
            contact: "",
            avatar: person.username.slice(0, 2).toUpperCase(),
            lastUpdate: "Just now",
            status: "normal",
            vitalSigns: {
              heartRate: 72,
              oxygenLevel: 98,
              bloodSugar: 95,
              temperature: 36.5,
            },
            dietData: {},
          }));

        // Filter out pending requests (accepted: false) from monitored_by list
        const mappedMonitoringMe: MonitoringMePerson[] = monitoredByArray
          .filter((person: ConnectionUser) => person.accepted !== false) // Only show accepted or undefined
          .map((person) => ({
            id: person.id,
            name: person.username,
            email: person.email,
            gender: "Unknown",
            contact: "",
            avatar: person.username.slice(0, 2).toUpperCase(),
            permissions: ["Vital Signs", "Diet Data"],
          }));

        setMonitoringPeople(mappedMonitoringPeople);
        setMonitoringMe(mappedMonitoringMe);
        setPendingRequests(response.pending_requests || []);
      } catch (error: any) {
        console.error("Error loading connections:", error);
        toast({
          title: "Error loading connections",
          description: error.message || "Failed to load connections",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [toast]);

  const handleAcceptRequest = async (id: number, selectedPermissions: string[]) => {
    try {
      const user = JSON.parse(localStorage.getItem("cliniq_user") || "{}");
      const token = localStorage.getItem("auth_token");
      if (!token || !user.username) {
        toast({
          title: "Authentication error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      await apiClient.acceptConnection(token, { id });

      const request = pendingRequests.find((r) => r.id === id);
      if (request) {
        setMonitoringMe([
          ...monitoringMe,
          {
            id: Date.now(),
            name: request.name,
            email: request.email,
            gender: request.gender,
            contact: request.contact,
            avatar: request.avatar,
            permissions: selectedPermissions,
          },
        ]);
        setPendingRequests(pendingRequests.filter((r) => r.id !== id));
        toast({
          title: "Request accepted",
          description: `${request.name} can now monitor your selected health data.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error accepting request",
        description: error.message || "Failed to accept request",
        variant: "destructive",
      });
    }
  };

  const handleDenyRequest = async (id: number) => {
    try {
      const user = JSON.parse(localStorage.getItem("cliniq_user") || "{}");
      const token = localStorage.getItem("auth_token");
      if (!token || !user.username) {
        toast({
          title: "Authentication error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      await apiClient.cancelConnection(token, { id });

      const request = pendingRequests.find((r) => r.id === id);
      setPendingRequests(pendingRequests.filter((r) => r.id !== id));
      toast({
        title: "Request denied",
        description: request ? `Connection request from ${request.name} has been denied.` : "Request denied.",
      });
    } catch (error: any) {
      toast({
        title: "Error denying request",
        description: error.message || "Failed to deny request",
        variant: "destructive",
      });
    }
  };

  const handleRequestClick = (request: PendingRequest) => {
    setSelectedRequest(request);
    setPendingRequestModalOpen(true);
  };

  const handleRemoveConnection = (type: "monitoring" | "monitoredBy", id: number) => {
    if (type === "monitoring") {
      const person = monitoringPeople.find((p) => p.id === id);
      setMonitoringPeople(monitoringPeople.filter((p) => p.id !== id));
      toast({
        title: "Connection removed",
        description: person ? `You are no longer monitoring ${person.name}.` : "Connection removed.",
      });
    } else {
      const person = monitoringMe.find((p) => p.id === id);
      setMonitoringMe(monitoringMe.filter((p) => p.id !== id));
      toast({
        title: "Access revoked",
        description: person ? `${person.name} can no longer see your health data.` : "Access revoked.",
      });
    }
  };

  const handlePersonClick = (person: MonitoringPerson) => {
    setSelectedPerson(person);
    setUserProfileModalOpen(true);
  };

  const handleEditPermissions = (person: MonitoringMePerson) => {
    setSelectedMonitoringPerson(person);
    setEditPermissionsModalOpen(true);
  };

  const handleSavePermissions = (id: number, permissions: string[]) => {
    setMonitoringMe(monitoringMe.map((person) => (person.id === id ? { ...person, permissions } : person)));
    toast({
      title: "Permissions updated",
      description: "The person's access permissions have been updated successfully.",
    });
  };

  const filteredMonitoringPeople = monitoringPeople.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredMonitoringMe = monitoringMe.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading connections...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Network</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your health monitoring connections</p>
          </div>
          <Button className="gap-2 w-full sm:w-auto" onClick={() => setAddConnectionOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add Connection
          </Button>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative mb-6 sm:mb-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search connections..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </motion.div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6 sm:mb-8">
            <h2 className="mb-4 flex items-center gap-2 font-heading text-base sm:text-lg font-semibold text-foreground">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-status-warning" />
              Pending Requests
              <span className="rounded-full bg-status-warning/15 px-2 py-0.5 text-xs font-medium text-status-warning">{pendingRequests.length}</span>
            </h2>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-status-warning/30 bg-status-warning/5 p-4 cursor-pointer hover:bg-status-warning/10 transition-colors"
                  onClick={() => handleRequestClick(request)}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 font-heading text-sm sm:text-base font-semibold text-primary">
                      {request.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base text-foreground">{request.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{request.requestType}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {request.requestedData.map((data) => (
                          <span key={data} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {data}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-13 sm:ml-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 flex-1 sm:flex-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDenyRequest(request.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                      Deny
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1 flex-1 sm:flex-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptRequest(request.id, request.requestedData);
                      }}
                    >
                      <Check className="h-4 w-4" />
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* People I'm Monitoring */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6 sm:mb-8">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-base sm:text-lg font-semibold text-foreground">
            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            People I'm Monitoring
          </h2>
          {filteredMonitoringPeople.length > 0 ? (
            <div className="space-y-3">
              {filteredMonitoringPeople.map((person) => (
                <div
                  key={person.id}
                  className="card-hover flex items-center justify-between rounded-xl border border-border bg-card p-3 sm:p-4 shadow-card cursor-pointer"
                  onClick={() => handlePersonClick(person)}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 font-heading text-sm sm:text-base font-semibold text-primary">
                      {person.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base text-foreground">{person.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-6">
                    <div className="hidden text-right sm:block">
                      {person.vitalSigns && (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full", person.status === "normal" ? "bg-status-normal" : "bg-status-warning")} />
                            <span className="text-sm font-medium text-foreground">{person.vitalSigns.heartRate} bpm</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full", person.status === "normal" ? "bg-status-normal" : "bg-status-warning")} />
                            <span className="text-sm font-medium text-foreground">{person.vitalSigns.oxygenLevel}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full", person.status === "normal" ? "bg-status-normal" : "bg-status-warning")} />
                            <span className="text-sm font-medium text-foreground">{person.vitalSigns.bloodSugar} mg/dL</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full", person.status === "normal" ? "bg-status-normal" : "bg-status-warning")} />
                            <span className="text-sm font-medium text-foreground">{person.vitalSigns.temperature}°F</span>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{person.lastUpdate}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Manage Permissions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleRemoveConnection("monitoring", person.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Connection
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 sm:p-8 text-center">
              <Eye className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">No connections found</p>
              <Button variant="outline" className="mt-4" onClick={() => setAddConnectionOpen(true)}>
                Add your first connection
              </Button>
            </div>
          )}
        </motion.div>

        {/* People Monitoring Me */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="mb-4 flex items-center gap-2 font-heading text-base sm:text-lg font-semibold text-foreground">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
            People Monitoring Me
          </h2>
          {filteredMonitoringMe.length > 0 ? (
            <div className="space-y-3">
              {filteredMonitoringMe.map((person) => (
                <div
                  key={person.id}
                  className="card-hover flex items-center justify-between rounded-xl border border-border bg-card p-3 sm:p-4 shadow-card"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-secondary/20 font-heading text-sm sm:text-base font-semibold text-secondary-foreground">
                      {person.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base text-foreground">{person.name}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {person.permissions.map((perm) => (
                          <span key={perm} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEditPermissions(person)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Edit Permissions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleRemoveConnection("monitoredBy", person.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Revoke Access
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 sm:p-8 text-center">
              <Users className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">No one is monitoring you yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <AddConnectionModal open={addConnectionOpen} onOpenChange={setAddConnectionOpen} />
      <PendingRequestModal
        open={pendingRequestModalOpen}
        onOpenChange={setPendingRequestModalOpen}
        request={selectedRequest}
        onAccept={handleAcceptRequest}
        onDeny={handleDenyRequest}
      />
      <UserProfileModal open={userProfileModalOpen} onOpenChange={setUserProfileModalOpen} person={selectedPerson} />
      <EditPermissionsModal
        open={editPermissionsModalOpen}
        onOpenChange={setEditPermissionsModalOpen}
        person={selectedMonitoringPerson}
        onSave={handleSavePermissions}
      />
    </AppLayout>
  );
}
