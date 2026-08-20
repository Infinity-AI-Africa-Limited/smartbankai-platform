import { useState, useRef, useEffect } from "react";
import WebBankingLayout from "@/components/WebBankingLayout";
import { trpc } from "@/lib/trpc";
import { Send, Sparkles, User, Bot, Mic, Paperclip, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Streamdown } from "streamdown";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  humanReviewRequired?: boolean;
};

const SUGGESTED_PROMPTS = [
  "What is my account balance?",
  "Show me my spending this month",
  "Am I eligible for a loan?",
  "Explain my last flagged transaction",
  "How can I improve my credit score?",
  "What are my top spending categories?",
];

const SYSTEM_CONTEXT = `You are SmartBank AI Assistant, an intelligent banking assistant powered by Infinity AI for First Bank Nigeria. You help customers with their banking needs.

Current customer context:
- Name: Adaeze Okonkwo
- Account: 3012847651 (Current Account)
- Balance: ₦2,847,650.45
- Savings: ₦1,250,000.00
- Credit Score: 742 (Good)
- Financial Health Score: 78/100
- Active Loan: Personal Loan — ₦500,000 (₦312,500 outstanding)
- Recent flagged transaction: Uber Lagos at 11:47 PM (Risk Score: 72%)
- Top spending categories: Shopping (₦47,400), Transport (₦24,200), Entertainment (₦24,500)
- Monthly income: ₦450,000
- Monthly expenses: ₦195,000

You are helpful, concise, and professional. You speak in a warm Nigerian banking context. You can answer questions about balances, transactions, loans, credit scores, fraud alerts, and financial advice. Always respond in English. Keep responses concise and actionable. When discussing amounts, always use Naira (₦) format.`;

export default function WebAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello Adaeze! 👋 I'm your SmartBank AI Assistant, powered by Infinity AI. I can help you with your account balance, transactions, loans, credit score, and financial insights. What would you like to know today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.chat.send.useMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const result = await chatMutation.mutateAsync({
        message: `[Customer Context: Adaeze Okonkwo, Balance: ₦2,847,650.45, Credit Score: 742, Active Loan: ₦312,500 outstanding] ${text}`,
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.reply,
        timestamp: new Date(),
        humanReviewRequired: result.humanReviewRequired,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment. In the meantime, you can check your balance at ₦2,847,650.45 and your credit score is 742.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([{
      id: "welcome-new",
      role: "assistant",
      content: "Hello Adaeze! 👋 Chat cleared. How can I help you today?",
      timestamp: new Date(),
    }]);
  };

  return (
    <WebBankingLayout>
      <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F47558]/15 border border-[#F47558]/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#F47558]" />
            </div>
            <div>
              <h1 className="text-white font-bold">SmartBank AI Assistant</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-white/40 text-xs">Powered by Infinity AI · Conversational Agent</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={clearChat} className="text-white/40 hover:text-white gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === "assistant"
                  ? "bg-[#F47558]/15 border border-[#F47558]/20"
                  : "bg-white/10 border border-white/15"
              }`}>
                {msg.role === "assistant"
                  ? <Bot className="w-4 h-4 text-[#F47558]" />
                  : <User className="w-4 h-4 text-white/60" />
                }
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-[#F47558]/15 border border-[#F47558]/20 rounded-tr-sm"
                  : "bg-white/6 border border-white/8 rounded-tl-sm"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="text-white/90 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                    <Streamdown>{msg.content}</Streamdown>
                  </div>
                ) : (
                  <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                )}
                <p className="text-white/25 text-xs mt-1.5">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                {msg.role === "assistant" && msg.humanReviewRequired && (
                  <p className="mt-2 text-[10px] font-medium text-amber-300">Advisory only — verify with your bank before acting.</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F47558]/15 border border-[#F47558]/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-[#F47558]" />
              </div>
              <div className="bg-white/6 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 2 && (
          <div className="mb-3 shrink-0">
            <p className="text-white/30 text-xs mb-2">Suggested questions</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/8 hover:border-white/20 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 shrink-0">
          <div className="flex-1 relative">
            <Input
              className="web-input h-12 pr-10"
              placeholder="Ask about your account, transactions, loans..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <Button type="submit" className="web-btn-primary h-12 w-12 p-0 shrink-0" disabled={!input.trim() || loading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-white/20 text-xs text-center mt-2 shrink-0">
          SmartBank AI provides advisory information only. Verify all important financial decisions with your bank.
        </p>
      </div>
    </WebBankingLayout>
  );
}
