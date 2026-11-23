import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { ProjectAnalysis, EquipmentMatchResult } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Sparkles,
  Send,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Bot,
  User,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  analysis?: ProjectAnalysis;
  matchedEquipment?: EquipmentMatchResult[];
}

export const AIAssistantPage: React.FC = () => {
  const navigate = useNavigate();

  const [inputPrompt, setInputPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "assistant",
      text: "Hello! I am your GenAI LabLink Campus Assistant powered by Google Gemini. Describe your semester project, capstone, or research experiment, and I will extract your hardware requirements, check live database availability across departments, and recommend optimal scheduling slots.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    "I am developing an IoT smart irrigation system with ESP32. I need soil moisture sensors, Raspberry Pi, and an oscilloscope. Deadline is Dec 15.",
    "Need a high-performance GPU workstation with CUDA to train a PyTorch vision model for 3 hours next Tuesday.",
    "Prototyping a custom robotic arm gripper. I need an industrial 3D printer for composite PLA parts and an Arduino controller.",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || isLoading) return;

    const userMsgId = Date.now().toString();
    const newMessages: ChatMessage[] = [
      ...messages,
      { id: userMsgId, sender: "user", text: prompt },
    ];
    setMessages(newMessages);
    setInputPrompt("");
    setIsLoading(true);

    try {
      // 1. Analyze project specifications with Gemini/deterministic fallback
      const analysis = await api.analyzeProject(prompt);

      // 2. Query grounded DB equipment
      const recommendRes = await api.recommendEquipment(prompt);

      const botReply = (
        `Analyzed project: "${analysis.project_title}". ` +
        `Identified ${analysis.extracted_requirements.length} required laboratory resource categories. ` +
        recommendRes.guidance
      );

      setMessages([
        ...newMessages,
        {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: botReply,
          analysis,
          matchedEquipment: recommendRes.matched_equipment,
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: "I encountered an issue analyzing your project description. Please verify that the backend is reachable.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              GenAI Laboratory Assistant
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Natural language project analysis grounded strictly in live PostgreSQL equipment inventory.
          </p>
        </div>
        <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
          Gemini 2.5 + Grounded DB Retrieval
        </Badge>
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-wrap gap-2">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="text-left text-xs bg-white hover:bg-slate-50 border border-slate-200 rounded-lg p-2.5 transition-all text-slate-700 max-w-sm flex-1 shadow-sm"
          >
            <span className="font-semibold text-indigo-600 block text-[10px] uppercase">Example prompt</span>
            <span className="line-clamp-2 mt-0.5">{p}</span>
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <Card className="border-slate-200/80 shadow-sm flex flex-col h-[650px] bg-slate-50/50">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl ${
                m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                }`}
              >
                {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>

                {/* Structured Requirements Analysis Card */}
                {m.analysis && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 space-y-2 mt-2">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="font-bold text-slate-900">Extracted Project Scope</span>
                      {m.analysis.deadline && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-600" />
                          Deadline: {new Date(m.analysis.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <p className="font-semibold text-indigo-700 text-[11px]">
                      {m.analysis.project_title}
                    </p>
                    <p className="text-[11px] text-slate-600">{m.analysis.summary}</p>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Identified Hardware Categories:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {m.analysis.extracted_requirements.map((r, i) => (
                          <span
                            key={i}
                            className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-[10px] font-medium px-2 py-0.5 rounded-md"
                          >
                            {r.name_hint || r.category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Grounded Equipment Recommendations */}
                {m.matchedEquipment && m.matchedEquipment.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Verified Matching Equipment from Campus Laboratories:
                    </span>

                    <div className="grid grid-cols-1 gap-2">
                      {m.matchedEquipment.map((eq) => (
                        <div
                          key={eq.equipment_id}
                          className="bg-white p-3 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all flex items-center justify-between shadow-sm"
                        >
                          <div className="space-y-0.5 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{eq.equipment_name}</span>
                              <Badge variant="outline" className="text-[9px] py-0">
                                {eq.category}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              {eq.department_name} • {eq.laboratory_name}
                            </p>
                            <p className="text-[10px] text-slate-600 italic">
                              "{eq.relevance_explanation}"
                            </p>
                          </div>

                          <div className="shrink-0 flex flex-col items-end gap-1.5">
                            <Badge
                              variant={eq.is_available ? "success" : "destructive"}
                              className="text-[9px]"
                            >
                              {eq.status}
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => navigate(`/student/booking/new?equipment_id=${eq.equipment_id}`)}
                              className="h-7 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                            >
                              Reserve Slot
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-md items-center">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                <span>Extracting requirements and querying database...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="e.g. 'I am building an FPGA video filter circuit using Artix-7 and an oscilloscope for test by next Friday'..."
              className="text-xs h-11"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
            >
              <Send className="w-4 h-4 mr-1.5" />
              <span>Send</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
