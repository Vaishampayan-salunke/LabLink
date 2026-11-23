import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { api } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Cpu, Mail, Lock, User, Hash, Building, ChevronDown, Check, CheckCircle2 } from "lucide-react";

interface DeptOption {
  id: string;
  name: string;
  code: string;
}

const FALLBACK_DEPARTMENTS: DeptOption[] = [
  { id: "dept-cse", name: "Computer Science & Engineering", code: "CSE" },
  { id: "dept-ece", name: "Electronics & Communication Engineering", code: "ECE" },
  { id: "dept-eee", name: "Electrical & Electronics Engineering", code: "EEE" },
  { id: "dept-mech", name: "Mechanical & Robotics Engineering", code: "MECH" },
  { id: "dept-bio", name: "Biotechnology & Chemical Engineering", code: "BIO" },
];

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<DeptOption[]>(FALLBACK_DEPARTMENTS);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await api.getDepartments();
        if (data && data.length > 0) {
          setDepartments(data);
          setDepartmentId(data[0].id);
        } else {
          setDepartmentId(FALLBACK_DEPARTMENTS[0].id);
        }
      } catch {
        setDepartmentId(FALLBACK_DEPARTMENTS[0].id);
      }
    };
    fetchDepts();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDeptOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDepartment = departments.find((d) => d.id === departmentId) || departments[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register({
        full_name: fullName,
        email,
        password,
        student_id: studentId,
        department_id: departmentId || selectedDepartment?.id,
      });
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please review your details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D19] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Subtle radial ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#5945E8]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-[#5945E8] to-[#8170F5] shadow-lg shadow-[#5945E8]/30 mb-3 text-white">
          <Cpu className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white">Create Account</h1>
        <p className="mt-1 text-xs sm:text-sm text-[#A0ABC0]">Join LabLink to reserve college laboratory resources</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="bg-[#151D30] border-[#1F2C4A] shadow-2xl text-[#F1F3FA]">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-bold text-white tracking-tight">Student Registration</CardTitle>
            <CardDescription className="text-xs text-[#A0ABC0]">
              Accounts are created with Student privileges by default.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-[#E34E62]/10 border border-[#E34E62]/20 text-[#F16B7B] text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#A0ABC0] mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-[#68758B]" />
                  <Input
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    style={{ colorScheme: "dark" }}
                    className="pl-9 bg-[#10182B] border-[#1F2C4A] text-white placeholder:text-[#68758B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A0ABC0] mb-1">Institutional Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-[#68758B]" />
                  <Input
                    type="email"
                    required
                    autoComplete="username email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    style={{ colorScheme: "dark" }}
                    className="pl-9 bg-[#10182B] border-[#1F2C4A] text-white placeholder:text-[#68758B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A0ABC0] mb-1">Student ID / Roll Number</label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3 top-3 text-[#68758B]" />
                  <Input
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="STU-2026-XXXX"
                    style={{ colorScheme: "dark" }}
                    className="pl-9 bg-[#10182B] border-[#1F2C4A] text-white placeholder:text-[#68758B]"
                  />
                </div>
              </div>

              {/* Custom Glitch-Free Dropdown for Academic Department */}
              <div ref={dropdownRef} className="relative">
                <label className="block text-xs font-semibold text-[#A0ABC0] mb-1">Academic Department *</label>
                <button
                  type="button"
                  onClick={() => setIsDeptOpen(!isDeptOpen)}
                  className="w-full h-11 px-3 pl-9 pr-9 rounded-[10px] border border-[#1F2C4A] bg-[#10182B] text-left text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#7968FF] transition-all flex items-center justify-between relative hover:border-[#7968FF]/50"
                >
                  <Building className="w-4 h-4 absolute left-3 text-[#68758B]" />
                  <span className="truncate">
                    {selectedDepartment ? `${selectedDepartment.name} (${selectedDepartment.code})` : "Select department..."}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#68758B] transition-transform ${isDeptOpen ? "rotate-180" : ""}`} />
                </button>

                {isDeptOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#151D30] border border-[#1F2C4A] rounded-xl shadow-2xl py-1 overflow-hidden">
                    {departments.map((d) => {
                      const isSelected = d.id === departmentId;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setDepartmentId(d.id);
                            setIsDeptOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? "bg-[#5945E8]/20 text-[#A394FF] font-semibold"
                              : "text-[#F1F3FA] hover:bg-[#1C2642]"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-bold text-[11px] px-1.5 py-0.5 rounded bg-[#10182B] border border-[#1F2C4A] text-[#7968FF]">
                              {d.code}
                            </span>
                            <span className="truncate">{d.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#21C997] shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A0ABC0] mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-[#68758B]" />
                  <Input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    style={{ colorScheme: "dark" }}
                    className="pl-9 bg-[#10182B] border-[#1F2C4A] text-white placeholder:text-[#68758B]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5945E8] hover:bg-[#4D39D9] text-white font-semibold py-2.5 h-11 text-sm mt-3 shadow-lg shadow-[#5945E8]/25"
              >
                {isLoading ? "Creating Account..." : "Register Account"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-[#1F2C4A] pt-4 pb-4">
            <p className="text-xs text-[#A0ABC0]">
              Already have an account?{" "}
              <Link to="/" className="font-semibold text-[#A394FF] hover:text-white hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
