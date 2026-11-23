import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { api } from "@/services/api";
import { Department } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Cpu, Mail, Lock, User, Hash, Building, ChevronDown, CheckCircle2 } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await api.getDepartments();
        if (data && data.length > 0) {
          setDepartments(data);
          setDepartmentId(data[0].id);
        }
      } catch {
        // Keep fallback departments
      }
    };
    fetchDepts();
  }, []);

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
        department_id: departmentId || undefined,
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
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Maya Lin"
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
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
                    className="pl-9 bg-[#10182B] border-[#1F2C4A] text-white placeholder:text-[#68758B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A0ABC0] mb-1">Academic Department *</label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-3.5 text-[#68758B] pointer-events-none" />
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full h-10 pl-9 pr-9 rounded-[10px] border border-[#1F2C4A] bg-[#10182B] text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#7968FF] transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select your academic department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#151D30] text-white py-1">
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-3.5 text-[#68758B] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A0ABC0] mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-[#68758B]" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
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
