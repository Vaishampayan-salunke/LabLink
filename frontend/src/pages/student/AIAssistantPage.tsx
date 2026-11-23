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
      // Step 1: Structured project requirement analysis
      const analysis: ProjectAnalysis = await api.analyzeProject(prompt);

      // Step 2: Grounded equipment retrieval from DB
      const matched = await api.recommendEquipment(prompt);

      setMessages([
        ...newMessages,
        {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: `I have analyzed your research goals. Here are the hardware specifications extracted by Gemini and matched against our live campus equipment inventory across departments:`,
          analysis: analysis,
          matchedEquipment: matched.matched_equipment || [],
        },
      ]);
    } catch (err: any) {
      console.error(err);
      try {
        const chatRes = await api.chatWithAI(prompt);
        setMessages([
          ...newMessages,
          {
            id: (Date.now() + 1).toString(),
            sender: "assistant",
            text: chatRes.reply,
            matchedEquipment: chatRes.suggested_equipment || [],
          },
        ]);
      } catch (fallbackErr) {
        setMessages([
          ...newMessages,
          {
            id: (Date.now() + 1).toString(),
            sender: "assistant",
            text: "Sorry, I encountered an issue analyzing your request. Please try again or rephrase your hardware requirements.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#10182B] via-[#151D30] to-[#1C2642] border border-[#1F2C4A] text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5945E8]/20 text-[#A394FF] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#7968FF]" />
            <span>Google Gemini 2.5 Flash SDK Integration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            GenAI Laboratory Project Assistant
          </h1>
          <p className="text-xs sm:text-sm text-[#A0ABC0] mt-1 max-w-xl">
            Describe your engineering problem in plain English. The AI analyzes requirements, queries the real database, and identifies available hardware.
          </p>
        </div>

        <Badge variant="success" className="text-xs self-start sm:self-auto">
          Online & Grounded to Database
        </Badge>
      </div>

      {/* Suggested prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="text-left text-xs bg-white dark:bg-[#151D30] hover:bg-[#EEF0FA]/60 dark:hover:bg-[#1C2642] border border-[#E2E8F0] dark:border-[#1F2C4A] rounded-xl p-3.5 transition-all text-[#172033] dark:text-[#F1F3FA] shadow-sm group"
          >
            <span className="font-semibold text-[#5945E8] dark:text-[#7968FF] block text-[10px] uppercase tracking-wider mb-1">
              Sample Prompt #{idx + 1}
            </span>
            <span className="line-clamp-2 text-[11px] text-[#68758B] dark:text-[#A0ABC0] group-hover:text-[#172033] dark:group-hover:text-[#F1F3FA] transition-colors">
              {p}
            </span>
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <Card className="flex flex-col h-[650px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl ${
                m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === "user"
                    ? "bg-[#5945E8] text-white"
                    : "bg-[#7968FF] text-white shadow-md shadow-[#7968FF]/20"
                }`}
              >
                {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 ${
                  m.sender === "user"
                    ? "bg-[#5945E8] text-white rounded-tr-none shadow-sm"
                    : "bg-[#F6F7FB] dark:bg-[#10182B] text-[#172033] dark:text-[#F1F3FA] border border-[#E2E8F0] dark:border-[#1F2C4A] rounded-tl-none shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>

                {/* Structured Requirements Analysis Card */}
                {m.analysis && (
                  <div className="p-3.5 bg-white dark:bg-[#151D30] rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] text-[#172033] dark:text-[#F1F3FA] space-y-2 mt-2">
                    <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1F2C4A] pb-2">
                      <span className="font-heading font-bold text-xs">Extracted Project Scope</span>
                      {m.analysis.deadline && (
                        <span className="text-[10px] text-[#68758B] dark:text-[#A0ABC0] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#5945E8] dark:text-[#7968FF]" />
                          Deadline: {new Date(m.analysis.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <p className="font-semibold text-[#5945E8] dark:text-[#A394FF] text-xs">
                      {m.analysis.project_title}
                    </p>
                    <p className="text-xs text-[#68758B] dark:text-[#A0ABC0]">{m.analysis.summary}</p>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#68758B] dark:text-[#A0ABC0]">
                        Identified Hardware Categories:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {m.analysis.extracted_requirements.map((r, i) => (
                          <span
                            key={i}
                            className="bg-[#EEF0FA] dark:bg-[#1C2642] border border-[#5945E8]/20 text-[#5945E8] dark:text-[#A394FF] text-[10px] font-medium px-2 py-0.5 rounded-md"
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#68758B] dark:text-[#A0ABC0] block">
                      Verified Matching Equipment from Campus Laboratories:
                    </span>

                    <div className="grid grid-cols-1 gap-2">
                      {m.matchedEquipment.map((eq) => (
                        <div
                          key={eq.equipment_id}
                          className="bg-white dark:bg-[#151D30] p-3 rounded-xl border border-[#E2E8F0] dark:border-[#1F2C4A] hover:border-[#5945E8] dark:hover:border-[#7968FF] transition-all flex items-center justify-between shadow-sm"
                        >
                          <div className="space-y-0.5 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-[#172033] dark:text-[#F1F3FA]">{eq.equipment_name}</span>
                              <Badge variant="outline" className="text-[9px] py-0">
                                {eq.category}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-[#68758B] dark:text-[#A0ABC0] line-clamp-1">
                              {eq.department_name} • {eq.relevance_explanation || "Compatible equipment"}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => navigate(`/student/booking/new?equipment_id=${eq.equipment_id}`)}
                            className="h-8 text-xs shrink-0 bg-[#5945E8] hover:bg-[#4D39D9]"
                          >
                            <span>Reserve</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-sm mr-auto">
              <div className="w-8 h-8 rounded-xl bg-[#7968FF] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-[#F6F7FB] dark:bg-[#10182B] rounded-2xl rounded-tl-none border border-[#E2E8F0] dark:border-[#1F2C4A] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#5945E8] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#5945E8] animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-[#5945E8] animate-bounce delay-200" />
                <span className="text-xs text-[#68758B] dark:text-[#A0ABC0] ml-1">Gemini AI is analyzing project...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-[#E2E8F0] dark:border-[#1F2C4A] bg-white dark:bg-[#151D30]">
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
              placeholder="Describe your research project, sensor needs, target deadline..."
              className="text-xs sm:text-sm"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="h-10 px-5 shrink-0 bg-[#5945E8] hover:bg-[#4D39D9]"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
