import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Send, Paperclip, Plus, Bot, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  image?: string;
}

interface User {
  firstName: string;
  lastName: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content: "Hello! How are you feeling today?",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

export default function Chat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("cliniq_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSend = () => {
    if (!input.trim() && !pendingImage) return;

    const newMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      image: pendingImage || undefined,
    };

    setMessages([...messages, newMessage]);
    setInput("");
    setPendingImage(null);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        role: "assistant",
        content:
          "Based on your recent vitals, everything looks stable. Your heart rate is within normal range, and your blood pressure is slightly elevated but nothing concerning. Would you like me to provide some tips to help manage your blood pressure?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleNewConversation = () => {
    setMessages([
      {
        id: 1,
        role: "assistant",
        content: `Hello, ${user?.firstName || "there"}. How can I help you with your health today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    toast({
      title: "New conversation started",
      description: "Your previous conversation has been cleared.",
    });
  };

  const handleAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPendingImage(base64);
        toast({
          title: "Image selected",
          description: "Add your message and press Enter to send the image with your instructions.",
        });
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid image file.",
        variant: "destructive",
      });
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto flex md:h-[calc(100vh-2rem)] h-[calc(100vh-6rem)] max-w-4xl flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Chat</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Secure messaging with your AI health assistant</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none" onClick={handleNewConversation}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Conversation</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </motion.div>

        {/* Chat Bot Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 flex items-center gap-3"
        >
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full gradient-hero">
            <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm sm:text-base text-foreground">Health Bot</p>
            <p className="flex items-center gap-1 text-xs text-status-normal">
              <span className="h-1.5 w-1.5 rounded-full bg-status-normal animate-pulse" />
              online
            </p>
          </div>
        </motion.div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card p-3 sm:p-4 shadow-card">
          <div className="space-y-4">
            {messages.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn("flex gap-2 sm:gap-3", message.role === "user" && "justify-end")}
              >
                {message.role === "assistant" && (
                  <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full gradient-hero">
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3",
                    message.role === "assistant" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                  )}
                >
                  {message.image && <img src={message.image} alt="Uploaded image" className="max-w-full h-auto rounded-lg mb-2" />}
                  {message.content && <p className="text-xs sm:text-sm">{message.content}</p>}
                  <div
                    className={cn(
                      "mt-1 flex items-center gap-2 text-xs",
                      message.role === "assistant" ? "text-muted-foreground" : "text-primary-foreground/70"
                    )}
                  >
                    <span>{message.timestamp}</span>
                    {message.role === "assistant" && (
                      <button className="hover:text-foreground transition-colors">
                        <Volume2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                {message.role === "user" && (
                  <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-xs sm:text-sm font-semibold text-primary">
                    {user?.firstName?.[0] || "J"}
                    {user?.lastName?.[0] || "D"}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10" onClick={handleAttachment}>
              <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Input
              placeholder={pendingImage ? "Add instructions for the image..." : "Type your message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 text-sm sm:text-base"
            />
            <Button onClick={handleSend} size="icon" className="shrink-0 h-10 w-10">
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">All messages are encrypted and HIPAA compliant</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} />
        </motion.div>
      </div>
    </AppLayout>
  );
}
