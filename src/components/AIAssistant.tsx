import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, X, ArrowUpRight, MessageSquare, Terminal } from "lucide-react";
import { Message } from "../types";
import { getApiBaseUrl } from "../firebase";

// High-end medical terms vocabulary etymologies to enrich local insights
const localGlossary: Record<string, string> = {
  cerebrum: "Latin for 'brain'. Controls conscious thought and sensory processing.",
  cerebellum: "Latin for 'little brain'. Master organ for motor coordination.",
  willis: "Named after Thomas Willis, 17th-century English pioneer of neuroanatomy.",
  aorta: "Greek 'aorte' meaning 'what is hung up'. The mother of all systemic arteries.",
  ventricle: "Latin 'ventriculus' meaning 'little belly'. Pumping chambers of the heart.",
  terminalis: "Latin for 'boundary'. Delimits embryological sinus venosus from true atrium."
};

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onHighlightTerm?: (term: string) => void;
}

export default function AIAssistant({ isOpen, onClose, onHighlightTerm }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "model",
      text: "Greetings, future dental surgeon! I am Dr. Krishna Garg's Dental Anatomy AI Synapse. What oral cavity, TMJ, masticatory musculature, or cranial nerve queries shall we dissect today? Let's master the head and neck framework together.",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setErrorMsg(null);

    const userMsg: Message = {
      id: "user-" + Date.now(),
      role: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === "API_KEY_MISSING") {
          throw new Error("Dr. Garg's AI Synapse requires a Gemini API key. Please configure GEMINI_API_KEY inside AI Studio Settings > Secrets panel.");
        }
        throw new Error(errorData.message || "Failed to communicate with anatomical intelligence core.");
      }

      const data = await response.json();

      const aiMsg: Message = {
        id: "ai-" + Date.now(),
        role: "model",
        text: data.text,
        timestamp: new Date(),
        anatomyHighlights: data.anatomyHighlights
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Trigger highlight feedback if a matching anatomical term is found
      if (data.anatomyHighlights && data.anatomyHighlights.length > 0 && onHighlightTerm) {
        onHighlightTerm(data.anatomyHighlights[0]);
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected neural interruption occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Safe custom Markdown-like parser to render bold words, lists, and headings cleanly
  const renderMessageText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Heading check
      if (line.startsWith("### ")) {
        return (
          <h4 key={i} className="text-sm font-semibold text-purple-900 mt-3 mb-1 font-display tracking-tight">
            {line.substring(4)}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={i} className="text-base font-bold text-purple-950 mt-4 mb-2 font-display tracking-tight">
            {line.substring(3)}
          </h3>
        );
      }

      // Bullet points
      let content = line;
      let isBullet = false;
      if (line.startsWith("- ") || line.startsWith("* ")) {
        content = line.substring(2);
        isBullet = true;
      }

      // Render bold tokens (**word**) and highlight triggers
      const parts = [];
      let lastIndex = 0;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;

      while ((match = boldRegex.exec(content)) !== null) {
        const before = content.substring(lastIndex, match.index);
        const boldText = match[1];

        if (before) parts.push(before);

        // Check if bold text is a trigger word
        const cleanBold = boldText.toLowerCase();
        const hasEtymology = localGlossary[cleanBold] !== undefined;

        parts.push(
          hasEtymology ? (
            <span
              key={match.index}
              className="font-semibold text-purple-700 bg-purple-50 px-1 rounded cursor-pointer hover:bg-purple-100 transition-colors inline-block group relative"
              onClick={() => onHighlightTerm && onHighlightTerm(cleanBold)}
            >
              {boldText}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 hidden group-hover:block bg-slate-900 text-white text-[9px] p-2 rounded shadow-lg z-50 font-sans normal-case leading-normal leading-relaxed">
                <span className="font-bold text-teal-300 block mb-0.5 font-mono">Etymology & Detail:</span>
                {localGlossary[cleanBold]}
              </span>
            </span>
          ) : (
            <strong key={match.index} className="font-bold text-purple-950 font-medium">
              {boldText}
            </strong>
          )
        );

        lastIndex = boldRegex.lastIndex;
      }

      const rest = content.substring(lastIndex);
      if (rest) parts.push(rest);

      if (isBullet) {
        return (
          <li key={i} className="ml-4 list-disc pl-1 text-slate-700 text-xs mb-1.5 leading-relaxed">
            {parts}
          </li>
        );
      }

      return line.trim() === "" ? (
        <div key={i} className="h-2" />
      ) : (
        <p key={i} className="text-xs text-slate-700 leading-relaxed mb-2">
          {parts}
        </p>
      );
    });
  };

  const quickPrompts = [
    { label: "Circle of Willis", text: "Explain the Circle of Willis and its primary anastomosis." },
    { label: "Crista Terminalis", text: "Detail the clinical landmarks of Crista Terminalis inside the Right Atrium." },
    { label: "Betz Cells", text: "What are giant pyramidal motor Betz cells and which layer hosts them?" },
    { label: "Winging Scapula", text: "Dissect the neuromuscular cause of a winged scapula." }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay mask */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Assistant Sidebar Canvas */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FFF8F3]/95 border-l border-white/50 shadow-2xl z-50 flex flex-col backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="p-5 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-orange-50/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-md shadow-purple-200">
                  <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display tracking-tight text-purple-950">Garg AI Synapse Core</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                    <span className="text-[10px] text-teal-600 font-mono tracking-wide">ANATOMICAL CORE ACTIVE</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm relative ${
                      msg.role === "user"
                        ? "bg-gradient-to-tr from-purple-600 to-purple-800 text-white rounded-tr-none glow-primary"
                        : "bg-white/70 border border-purple-100 text-slate-800 rounded-tl-none backdrop-blur-sm"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-xs leading-relaxed font-medium">{msg.text}</p>
                    ) : (
                      <div className="space-y-1">
                        {renderMessageText(msg.text)}
                        {msg.anatomyHighlights && msg.anatomyHighlights.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-purple-50">
                            {msg.anatomyHighlights.map((term) => (
                              <button
                                key={term}
                                onClick={() => onHighlightTerm && onHighlightTerm(term)}
                                className="text-[9px] font-mono font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-1.5 py-0.5 rounded transition-all flex items-center gap-0.5"
                              >
                                <Terminal className="w-2.5 h-2.5" />
                                Highlight {term.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <span
                      className={`text-[9px] block mt-1.5 text-right opacity-60 font-mono ${
                        msg.role === "user" ? "text-purple-200" : "text-slate-400"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/70 border border-purple-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "0s" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "0.3s" }} />
                    <span className="text-[10px] text-purple-700 font-mono tracking-wide ml-1">Synapsing...</span>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3 text-xs text-rose-800">
                  <p className="font-semibold mb-1">Synapse Interruption:</p>
                  <p>{errorMsg}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts suggestions */}
            {messages.length === 1 && (
              <div className="px-5 py-3 border-t border-purple-50 bg-purple-50/20">
                <p className="text-[10px] font-semibold text-purple-950 font-mono mb-2 uppercase tracking-wider">
                  Surgical Coordinates Discussions:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickPrompts.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => handleSend(p.text)}
                      className="text-left text-[10px] text-slate-700 hover:text-purple-950 bg-white border border-purple-100 hover:border-purple-300 rounded-lg p-2 transition-all hover:shadow-sm flex items-center justify-between"
                    >
                      <span className="truncate pr-1">{p.label}</span>
                      <ArrowUpRight className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputText);
              }}
              className="p-4 border-t border-purple-100 bg-white/40 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Dr. Garg's AI Synapse..."
                disabled={isLoading}
                className="flex-1 bg-white/90 border border-purple-100 focus:border-purple-300 focus:ring-1 focus:ring-purple-300 rounded-full px-4 py-2 text-xs outline-none transition-all placeholder:text-slate-400 text-slate-800 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-purple-800 text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:scale-100 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
