import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Send, CheckCircle2, Sparkles, Smartphone } from "lucide-react";
import { addContactToDb } from "../dbService";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !mobile.trim() || !message.trim()) {
      setError("Please fill in all required fields (Name, Email, Mobile Number, Message).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const contactId = "contact_" + Math.random().toString(36).substr(2, 9);
      await addContactToDb({
        id: contactId,
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        subject: subject.trim() || "General Inquiry",
        message: message.trim(),
        timestamp: new Date().toISOString(),
        read: false
      });

      setSuccess(true);
      setName("");
      setEmail("");
      setMobile("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      console.error(err);
      setError("Failed to transmit message. Please check your network connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12 relative z-10">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-[10px] font-mono font-bold tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full uppercase">
          Get In Touch
        </span>
        <h2 className="text-3xl font-extrabold font-display tracking-tight text-slate-900 leading-none">
          Contact Us
        </h2>
        <p className="text-xs text-slate-500 font-light leading-relaxed">
          Have a question about courses, books, or study materials? Feel free to contact our support team. We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        {/* Contact info details panel */}
        <div className="md:col-span-5 glass-panel rounded-3xl p-6 md:p-8 space-y-8 flex flex-col justify-between border border-white/60 bg-white/70 shadow-lg">
          <div className="space-y-6">
            <h3 className="text-base font-bold font-display text-slate-900 border-b border-purple-50 pb-3">
              Contact Details
            </h3>

            {/* Email */}
            <div className="flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Email Address</h4>
                <p className="text-xs text-purple-700 font-medium font-mono break-all">
                  divyaprakashprajapati478@gmail.com
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-purple-100 space-y-2">
            <span className="text-[9px] font-mono font-bold tracking-widest text-teal-600 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Instant Support
            </span>
            <p className="text-[10px] text-slate-400 leading-normal font-light">
              Your messages are sent directly to our team, and we will get back to you as soon as possible.
            </p>
          </div>
        </div>

        {/* Contact Form panel */}
        <div className="md:col-span-7 glass-panel rounded-3xl p-6 md:p-8 border border-white/60 bg-white/85 shadow-lg flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-5 flex-1">
            <div className="space-y-1">
              <h3 className="text-base font-bold font-display text-slate-900">
                Send Direct Message
              </h3>
              <p className="text-[10px] text-slate-500 font-light">
                Please provide your contact information and details of your request.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-teal-50 border border-teal-200 rounded-2xl p-5 text-center space-y-3"
                >
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mx-auto text-teal-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-teal-900 uppercase font-mono tracking-wider">
                      Message Sent Successfully!
                    </h4>
                    <p className="text-[11px] text-teal-800 font-light leading-relaxed max-w-md mx-auto">
                      Thank you for reaching out. We have received your message and will get back to you within 24-48 hours.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="mt-2 text-[10px] font-mono font-bold text-teal-700 hover:underline hover:text-teal-900 cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] px-3.5 py-2.5 rounded-xl font-mono">
                      {error}
                    </div>
                  )}

                  {/* Grid fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Academic Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="your.email@example.com..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Mobile Number & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-slate-400" />
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g., +91 98765 43210"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Subject
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Question about study books..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Type your inquiry here in detail..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none resize-none transition-all"
                    />
                  </div>

                  {/* Submit button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 hover:opacity-90 disabled:opacity-50 text-white font-medium text-xs rounded-xl uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-purple-500/10 active:scale-[0.99]"
                    >
                      {loading ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
}
