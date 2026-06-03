import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { AgentBadge } from "@/components/AgentBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Trash2, Bot, User, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Streamdown } from "streamdown";

const SUGGESTED = [
  "What is the current fraud rate across all tenants?",
  "Summarize CBN compliance requirements for Q2 2026",
  "Which tenant has the highest credit default risk this month?",
  "Generate a risk assessment for a ₦5M loan application",
  "What are the top 3 AML red flags I should monitor?",
  "Explain the alternative data scoring model for unbanked customers",
];

export default function ConversationalAgent() {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const historyQuery = trpc.chat.history.useQuery();
  const sendMutation = trpc.chat.send.useMutation({
    onSuccess: () => historyQuery.refetch(),
    onError: (e) => toast.error(e.message),
  });
  const clearMutation = trpc.chat.clear.useMutation({
    onSuccess: () => { historyQuery.refetch(); toast.success("Conversation cleared"); },
  });

  const messages = historyQuery.data ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMutation.isPending]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg) return;
    setInput("");
    sendMutation.mutate({ message: msg });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <AgentBadge name="Conversational" size="lg" showDesc />
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Active</Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-400 gap-1.5 text-xs"
          onClick={() => clearMutation.mutate()}>
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </Button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-[#1E2A3A] p-4 space-y-4 mb-4" style={{ background: "#111827" }}>
        {messages.length === 0 && !sendMutation.isPending ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <Sparkles className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">SmartBank AI Conversational Agent</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Ask anything about your financial platform — fraud trends, credit risk, compliance, or market insights for Nigeria and Africa.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED.map((s) => (
                <button key={s} onClick={() => { setInput(s); }}
                  className="text-left text-xs text-slate-400 hover:text-white p-2.5 rounded-lg border border-[#1E2A3A] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                )}
                <div className={cn("max-w-[80%] rounded-xl px-4 py-3 text-sm",
                  msg.role === "user"
                    ? "bg-blue-600/20 text-white border border-blue-500/20"
                    : "bg-white/5 text-slate-200 border border-[#1E2A3A]"
                )}>
                  {msg.role === "assistant" ? (
                    <Streamdown className="prose prose-invert prose-sm max-w-none">{msg.content}</Streamdown>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <div className="text-[10px] text-slate-600 mt-1.5">
                    {new Date(msg.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
            {sendMutation.isPending && (
              <div className="flex gap-3 justify-start">
                <div className="h-7 w-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
                </div>
                <div className="bg-white/5 border border-[#1E2A3A] rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about fraud trends, credit risk, compliance, market insights..."
          className="flex-1 min-h-[48px] max-h-32 resize-none bg-white/5 border-[#1E2A3A] text-white placeholder:text-slate-500 text-sm rounded-xl"
          rows={1}
        />
        <Button onClick={handleSend} disabled={!input.trim() || sendMutation.isPending}
          className="gradient-brand text-white h-12 w-12 p-0 rounded-xl flex-shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
