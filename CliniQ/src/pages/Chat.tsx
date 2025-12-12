import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Send, Paperclip, Plus, Bot, Volume2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getGeminiResponse, clearConversationHistory } from "@/hooks/gemini";

interface Message {
  id: number;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  image?: string;
  isLoading?: boolean;
}

interface User {
  firstName: string;
  lastName: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content: "Hello! I'm Minda, your virtual doctor here to assist. How are you feeling today?",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

export default function Chat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("cliniq_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !pendingImage) return;

    const messageText = input.trim();
    const newMessage: Message = {
      id: Date.now(),
      role: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      image: pendingImagePreview || undefined,
    };

    setMessages([...messages, newMessage]);
    setInput("");
    setPendingImage(null);
    setPendingImagePreview(null);

    // Add loading message
    const loadingMessage: Message = {
      id: Date.now() + 1,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);
    setIsLoading(true);

    try {
      const aiResponse = await getGeminiResponse(messageText, {
        imageFile: pendingImage || undefined,
      });

      // Replace loading message with actual response
      setMessages((prev) => prev.map((msg) => (msg.id === loadingMessage.id ? { ...msg, content: aiResponse, isLoading: false } : msg)));
    } catch (error: any) {
      console.error("Error getting AI response:", error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: "Sorry, I'm having trouble responding right now. Please try again.",
                isLoading: false,
              }
            : msg
        )
      );

      toast({
        title: "Error",
        description: error.message || "Failed to get response from AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    clearConversationHistory();
    setMessages([
      {
        id: 1,
        role: "assistant",
        content: `Hello${user?.firstName ? `, ${user.firstName}` : ""}! I'm Minda. How can I support you today?`,
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
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPendingImage(file);
        setPendingImagePreview(base64);
        toast({
          title: "Image selected",
          description: "Add your message and press Enter to send the image with your instructions.",
        });
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid image file (JPEG, PNG, etc.).",
        variant: "destructive",
      });
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePendingImage = () => {
    setPendingImage(null);
    setPendingImagePreview(null);
    toast({
      title: "Image removed",
      description: "The attached image has been removed.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        handleSend();
      }
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
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Emotional Support Chat</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Talk with Minda, powered by Gemini AI</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none" onClick={handleNewConversation}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Chat</span>
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
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
            <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-sm sm:text-base text-foreground">Minda - Virtual Doctor</p>
            <p className="flex items-center gap-1 text-xs text-green-600">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
              Powered by Gemini AI
            </p>
          </div>
        </motion.div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-3 sm:p-4 shadow-card">
          <div className="space-y-4">
            {messages.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn("flex gap-2 sm:gap-3", message.role === "user" && "justify-end")}
              >
                {message.role === "assistant" && (
                  <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3",
                    message.role === "assistant"
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-foreground"
                      : "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-sm"
                  )}
                >
                  {message.image && (
                    <div className="relative mb-2">
                      <img src={message.image} alt="Uploaded image" className="max-w-full h-auto rounded-lg border border-border" />
                    </div>
                  )}
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                      <p className="text-xs sm:text-sm">Minda is thinking...</p>
                    </div>
                  ) : (
                    message.content && <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  <div
                    className={cn(
                      "mt-1 flex items-center gap-2 text-xs",
                      message.role === "assistant" ? "text-muted-foreground" : "text-primary-foreground/70"
                    )}
                  >
                    <span>{message.timestamp}</span>
                    {message.role === "assistant" && !message.isLoading && (
                      <button
                        className="hover:text-foreground transition-colors"
                        onClick={() => {
                          const utterance = new SpeechSynthesisUtterance(message.content);
                          speechSynthesis.speak(utterance);
                        }}
                        title="Read aloud"
                      >
                        <Volume2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                {message.role === "user" && (
                  <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 font-heading text-xs sm:text-sm font-semibold text-primary">
                    {user?.firstName?.[0] || "J"}
                    {user?.lastName?.[0] || "D"}
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Pending Image Preview */}
        {pendingImagePreview && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 border border-border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Image to send:</p>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={removePendingImage}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <img src={pendingImagePreview} alt="Preview" className="max-h-32 w-auto rounded border border-border" />
            </div>
          </motion.div>
        )}

        {/* Input Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10" onClick={handleAttachment} disabled={isLoading}>
              <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Input
              placeholder={pendingImage ? "Add instructions for the image..." : "Share how you're feeling..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 text-sm sm:text-base"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="shrink-0 h-10 w-10 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              disabled={(!input.trim() && !pendingImage) || isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Send className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Press Enter to send • Shift+Enter for new line</p>
            <p className="text-xs text-muted-foreground">Powered by Gemini AI</p>
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} />
        </motion.div>
      </div>
    </AppLayout>
  );
}
