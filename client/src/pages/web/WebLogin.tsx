import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, EyeOff, Smartphone, Globe, Landmark, Zap, Lock, CheckCircle2 } from "lucide-react";

export default function WebLogin() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [showPass, setShowPass] = useState(false);
  const [accountNumber, setAccountNumber] = useState("3012847651");
  const [password, setPassword] = useState("••••••••");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: user } = trpc.auth.me.useQuery();

  if (user) {
    navigate("/web/dashboard");
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1200);
  };

  const handleOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = getLoginUrl();
    }, 1000);
  };

  return (
    <div className="min-h-screen web-banking-bg flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#F47558]/8 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#1B365D]/30 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F47558] to-[#1B365D] flex items-center justify-center">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">SmartBank AI</p>
            <p className="text-white/40 text-xs">Powered by Infinity AI</p>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative">
          <div className="mobile-ai-chip mb-6 inline-flex">
            <Zap className="w-3 h-3" />
            AI-Native Banking Experience
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            The Next Frontier of<br />
            <span className="text-[#F47558]">Digital Banking</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed mb-8">
            8 specialized AI agents working together to deliver a proactive, intelligent, and highly personalized financial journey.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3">
            {["Real-time Fraud Detection", "AI Credit Scoring", "Smart Insights", "24/7 AI Assistant"].map(f => (
              <div key={f} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-white/70 text-xs">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Badge */}
        <div className="relative flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
          <Shield className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <p className="text-white text-sm font-semibold">Bank-Grade Security</p>
            <p className="text-white/40 text-xs">256-bit encryption · Biometric auth · AI fraud protection</p>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F47558] to-[#1B365D] flex items-center justify-center">
              <Landmark className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold">SmartBank AI</p>
              <p className="text-white/40 text-xs">Web Banking</p>
            </div>
          </div>

          {/* Channel Switcher */}
          <div className="flex gap-2 mb-8 p-1 bg-white/5 border border-white/10 rounded-xl">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#F47558] text-white text-sm font-medium">
              <Globe className="w-4 h-4" />
              Web Banking
            </button>
            <a href="/mobile" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-white/50 hover:text-white/80 text-sm font-medium transition-colors">
              <Smartphone className="w-4 h-4" />
              Mobile App
            </a>
          </div>

          {step === "credentials" ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
                <p className="text-white/50">Sign in to your First Bank Nigeria account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">Account Number</label>
                  <Input
                    className="web-input h-12"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">Password</label>
                  <div className="relative">
                    <Input
                      className="web-input h-12 pr-12"
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-white/50 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked />
                    Remember device
                  </label>
                  <button type="button" className="text-[#F47558] hover:text-[#f5856a]">
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="web-btn-primary w-full h-12 text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : "Sign In"}
                </Button>

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/30 text-xs">or continue with</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <Button
                  type="button"
                  className="web-btn-secondary w-full h-12"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  Sign in with Infinity AI Account
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verify your identity</h2>
                <p className="text-white/50">
                  We sent a 6-digit OTP to your registered phone number ending in <strong className="text-white">••••7823</strong>
                </p>
              </div>

              <form onSubmit={handleOtp} className="space-y-5">
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">One-Time Password</label>
                  <Input
                    className="web-input h-14 text-center text-2xl tracking-[0.5em] font-bold"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>

                <div className="web-ai-insight flex items-start gap-3">
                  <Shield className="w-4 h-4 text-[#F47558] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white/80 text-xs font-medium">AI Fraud Check Active</p>
                    <p className="text-white/40 text-xs mt-0.5">Login risk score: <span className="text-emerald-400 font-medium">Low (0.04)</span> — No suspicious activity detected</p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="web-btn-primary w-full h-12 text-base"
                  disabled={loading || otp.length < 6}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : "Verify & Sign In"}
                </Button>

                <p className="text-center text-white/40 text-sm">
                  Didn't receive OTP?{" "}
                  <button type="button" className="text-[#F47558] hover:text-[#f5856a]">
                    Resend in 0:45
                  </button>
                </p>

                <button
                  type="button"
                  className="w-full text-white/40 hover:text-white/70 text-sm transition-colors"
                  onClick={() => setStep("credentials")}
                >
                  ← Back to login
                </button>
              </form>
            </>
          )}

          {/* Demo Note */}
          <div className="mt-8 p-3 bg-[#F47558]/8 border border-[#F47558]/15 rounded-xl">
            <p className="text-[#F47558]/80 text-xs text-center">
              <strong>Demo Mode:</strong> Use any credentials. OTP: any 6 digits. Powered by SmartBank AI demo data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
