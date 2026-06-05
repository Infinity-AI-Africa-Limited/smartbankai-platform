import { useState, useRef, useEffect } from "react";
import MobileAppLayout from "@/components/MobileAppLayout";
import { Sparkles, Send, Mic, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "What's my account balance?",
  "Show recent transactions",
  "How's my credit score?",
  "Any suspicious activity?",
  "Loan options for me?",
  "Spending analysis",
];

const WELCOME_MSG: Message = {
  id: "welcome",
  role: "assistant",
  content: `Hello Adaeze! 👋 I'm your **SmartBank AI Financial Intelligence Agent**, powered by Infinity AI.

I can help you with:
- **Account & balance** queries
- **Transaction** history and analysis
- **Credit score** and loan eligibility
- **Fraud alerts** and security
- **Spending insights** and budgeting
- **CBN regulations** and banking guidance

What would you like to know today?`,
  timestamp: new Date(),
};

export default function MobileAssistant() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.chat.send.useMutation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    setLoading(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const result = await chatMutation.mutateAsync({
        message: `[Customer: Adaeze Okonkwo | Account: 3012847651 | Balance: ₦2,847,650.45 | Credit Score: 742 | Active Loan: ₦312,500 outstanding | Channel: Mobile Super App] ${text}`,
      });
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm experiencing a brief interruption. Please try again in a moment.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileAppLayout title="AI Assistant" showBack>
      <div className="flex flex-col h-[calc(100vh-160px)]">

        {/* AI Header */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-white/8">
          <div className="w-10 h-10 rounded-2xl bg-[#F47558]/15 border border-[#F47558]/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#F47558]" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Financial Intelligence Agent</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-emerald-400 text-xs">Online · Powered by Infinity AI</p>
            </div>
          </div>
          <button onClick={() => setMessages([WELCOME_MSG])} className="text-white/30 hover:text-white/60 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-xl bg-[#F47558]/15 border border-[#F47558]/20 flex items-center justify-center mr-2 mt-1 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#F47558]" />
                </div>
              )}
              <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-[#F47558]/15 border border-[#F47558]/20 rounded-tr-sm"
                  : "bg-white/6 border border-white/10 rounded-tl-sm"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="text-white/80 text-sm leading-relaxed prose-sm">
                    <Streamdown>{msg.content}</Streamdown>
                  </div>
                ) : (
                  <p className="text-white text-sm">{msg.content}</p>
                )}
                <p className="text-white/20 text-[10px] mt-1.5">
                  {msg.timestamp.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-xl bg-[#F47558]/15 border border-[#F47558]/20 flex items-center justify-center mr-2 mt-1 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-[#F47558]" />
              </div>
              <div className="bg-white/6 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => sendMessage(p)}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/8 hover:text-white transition-all">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t border-white/8">
          <div className="flex gap-2 items-end">
            <div className="flex-1 bg-white/6 border border-white/12 rounded-2xl px-4 py-3 flex items-center gap-2">
              <input
                className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none"
                placeholder="Ask me anything about your finances..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              />
              <button className="text-white/30 hover:text-white/60 transition-colors">
                <Mic className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-2xl bg-[#F47558] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </MobileAppLayout>
  );
}
