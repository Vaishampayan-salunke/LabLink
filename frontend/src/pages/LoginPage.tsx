import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Cpu, Eye, EyeOff, Lock, Mail, ShieldAlert, Sparkles, UserCheck, GraduationCap, ArrowRight } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "FACULTY") {
        navigate("/faculty/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  const prefillAccount = (targetEmail: string, targetPass: string) => {
    setEmail(targetEmail);
    setPassword(targetPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/25 mb-4">
          <Cpu className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">LabLink</h1>
        <p className="mt-2 text-sm text-slate-400">Making College Laboratories More Accessible</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur-xl text-slate-100">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-white tracking-tight">Sign in to your account</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Access cross-department equipment, book laboratory slots, or manage approvals.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu or demo account"
                    className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-9 pr-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-400">
                  Keep me signed in on this device
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 h-11 text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Quick Demo Accounts Selection */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Fill Credentials with Demo Persona</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => prefillAccount("admin@lablink.demo", "LabLink@Demo2026")}
                  className="px-2.5 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5 mb-0.5 text-rose-400 font-semibold text-xs">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">Dean of Labs</p>
                </button>

                <button
                  type="button"
                  onClick={() => prefillAccount("faculty.ece@lablink.demo", "LabLink@Faculty2026")}
                  className="px-2.5 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5 mb-0.5 text-indigo-400 font-semibold text-xs">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Faculty</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">Prof. Rostova</p>
                </button>

                <button
                  type="button"
                  onClick={() => prefillAccount("student.alex@lablink.demo", "LabLink@Student2026")}
                  className="px-2.5 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5 mb-0.5 text-emerald-400 font-semibold text-xs">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Student</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">Alex Rivera</p>
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-slate-800/60 pt-4 pb-4">
            <p className="text-xs text-slate-400">
              Don't have an account yet?{" "}
              <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                Register as Student
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
