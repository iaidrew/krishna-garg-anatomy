import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, ShieldCheck, Award, Heart, Dna, Brain, ChevronDown, CheckCircle2, ChevronRight, BookOpen, Quote, Key, Lock, AlertCircle, User } from "lucide-react";
import { mainTeacher, coursesData, timelineEvents, faqData, testimonials } from "../data";
import { DNAModel, HeartModel, BrainModel, MedicalGeometry } from "./AnatomyModels";

interface LandingPageProps {
  onNavigate: (tab: "home" | "about" | "contact" | "courses" | "upload" | "admin" | "auth", extraId?: string) => void;
  onOpenAI: () => void;
  onUnlockWithPasscode: (passcode: string) => { success: boolean; message: string; title?: string };
}

export default function LandingPage({ onNavigate, onOpenAI, onUnlockWithPasscode }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [faqCategory, setFaqCategory] = useState<string>("All");
  const [passcode, setPasscode] = useState("");
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [teacherImageError, setTeacherImageError] = useState(false);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setFeedback({ success: false, message: "Please enter a passcode." });
      return;
    }
    const result = onUnlockWithPasscode(passcode);
    setFeedback({ success: result.success, message: result.message });
    if (result.success) {
      setPasscode("");
    }
  };

  // Stats Counters
  const stats = [
    { value: "40,000+", label: "Physicians Trained" },
    { value: "98.7%", label: "Surgical Board Pass Rate" },
    { value: "35+", label: "Anatomical Manuals Published" },
    { value: "120+", label: "Anatomy Study Guides" }
  ];

  // Filtering FAQ
  const filteredFaq = faqCategory === "All"
    ? faqData
    : faqData.filter(f => f.category === faqCategory);

  const faqCategories = ["All", "Teaching Method", "How It Works", "AI Assistant", "Certificates"];

  return (
    <div className="relative pt-4 pb-16 sm:pt-6 sm:pb-20 space-y-16 sm:space-y-24 md:space-y-32">
      {/* BACKGROUND GRAPHICS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] aurora-blur-1 opacity-70 pointer-events-none z-0" />
      <div className="absolute top-[800px] right-10 w-[600px] h-[600px] aurora-blur-2 opacity-60 pointer-events-none z-0" />
      <div className="absolute bottom-[400px] left-10 w-[500px] h-[500px] aurora-blur-3 opacity-80 pointer-events-none z-0" />

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 mt-4 sm:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-gradient-to-tr from-purple-100 to-purple-50/50 border border-purple-200/50 px-3.5 py-1.5 rounded-full shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-[10px] font-mono font-bold tracking-wider text-purple-800 uppercase">
                A NEW ERA OF ANATOMY LEARNING
              </span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-slate-900 leading-[1.08]"
              >
                Human Anatomy <br />
                <span className="text-gradient-primary">for Dental Students.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-sm md:text-base text-slate-600 leading-relaxed max-w-xl font-light"
              >
                The Dr. Krishna Garg Anatomy Library is designed to simplify human anatomy, head & neck, and dental studies specifically for students under the personal authorship of India's leading educator.
              </motion.p>
            </div>

            {/* CTA Controls */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-2"
            >
              <button
                onClick={() => onNavigate("courses")}
                className="group relative px-5 sm:px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium text-xs tracking-tight shadow-lg shadow-purple-500/20 hover:scale-[1.03] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                View Anatomy Courses
                <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenAI}
                className="px-5 sm:px-6 py-3 rounded-full bg-white border border-purple-100 text-purple-950 font-medium text-xs tracking-tight hover:bg-purple-50/50 hover:border-purple-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                Ask Dr. Garg's AI Assistant
              </button>
            </motion.div>

            {/* Direct Access Passcode Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3 sm:p-4 space-y-2.5 shadow-sm"
            >
              <div className="flex items-center gap-2 text-purple-950">
                <Key className="w-4 h-4 text-purple-700 shrink-0" />
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider">
                  Direct Lecture Access Passcode
                </h4>
              </div>
              <p className="text-[10px] text-slate-500 font-light leading-snug">
                Did your instructor share a passcode-locked lecture with you? Enter the lecture's password below to instantly unlock and launch the media player.
              </p>
              
              <form onSubmit={handlePasscodeSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. SKULL2026..."
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setFeedback(null);
                  }}
                  className="flex-1 bg-white border border-purple-200 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-950 hover:bg-purple-900 text-white font-semibold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer shrink-0"
                >
                  Access Content
                </button>
              </form>

              {feedback && (
                <div className={`p-2 rounded-lg text-[10px] font-mono leading-normal flex items-start gap-1.5 ${
                  feedback.success ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}>
                  {feedback.success ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}
            </motion.div>

            {/* Quick Metrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="grid grid-cols-2 gap-3 sm:gap-6 pt-6 border-t border-purple-100 sm:grid-cols-4"
            >
              {stats.map((st, i) => (
                <div key={i} className="space-y-1">
                  <h3 className="text-xl font-extrabold font-mono text-purple-900 tracking-tight">{st.value}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold leading-tight">{st.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero Right Visuals: Interactive 3D glass models */}
          <div className="lg:col-span-5 relative flex items-center justify-center mt-6 lg:mt-0">
            <div className="w-full max-w-sm rounded-3xl border border-white/70 bg-white/70 p-4 shadow-xl backdrop-blur-xl sm:hidden">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-purple-800 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-900">Study Flow</h4>
                  <p className="text-[8px] font-mono text-purple-600 uppercase">Mobile-Friendly Learning</p>
                </div>
              </div>
              <div className="space-y-2.5 text-[10px] text-slate-600">
                <div className="rounded-2xl bg-purple-50 p-3">Interactive anatomy models and guided lecture pathways.</div>
                <div className="rounded-2xl bg-rose-50 p-3">Quick access to diagrams, notes, and AI tutoring.</div>
              </div>
            </div>

            {/* Medical geometry backing */}
            <div className="absolute inset-0 hidden lg:flex items-center justify-center pointer-events-none">
              <MedicalGeometry className="w-80 h-80 opacity-50" />
            </div>

            {/* Foreground layered cards */}
            <div className="relative hidden sm:block w-full max-w-sm h-[320px] sm:h-[360px] lg:h-[400px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
                className="absolute top-0 right-4 w-60 glass-panel rounded-2xl p-4 shadow-xl z-20 hover:translate-y-[-5px] transition-transform"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-900">Neural Network</h4>
                    <p className="text-[8px] font-mono text-purple-600 uppercase">Interactive Synapses</p>
                  </div>
                </div>
                <BrainModel className="w-32 h-32 mx-auto" />
                <p className="text-[9px] text-slate-500 text-center font-mono mt-1">Hover synpatic nodes to map cortical areas</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -30, y: 120 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 130 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.4 }}
                className="absolute bottom-10 left-0 w-52 glass-panel-darker rounded-2xl p-4 shadow-xl z-30 hover:translate-y-[125px] transition-transform"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-900">Heart Anatomy</h4>
                    <p className="text-[8px] font-mono text-rose-500 uppercase">Heart Studies</p>
                  </div>
                </div>
                <HeartModel className="w-24 h-24 mx-auto" />
                <p className="text-[9px] text-slate-500 text-center font-mono mt-2">Simulating Heartbeat Rhythm</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -40 }}
                animate={{ opacity: 1, scale: 1, y: -10 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.6 }}
                className="absolute top-16 -left-12 w-40 bg-white/40 border border-white/30 rounded-2xl p-3 shadow-lg z-10 hover:translate-y-[-15px] transition-transform"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <Dna className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-[10px] font-bold text-slate-900">Study Guides</h4>
                </div>
                <DNAModel className="w-24 h-24 mx-auto" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTITUTION HIGHLIGHTS & PLATFORM FEATURES */}
      <section className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 space-y-10 sm:space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-[10px] font-mono font-bold tracking-widest text-purple-600 uppercase">
            WHY KRISHNA GARG ANATOMY
          </h2>
          <h3 className="text-3xl font-extrabold font-display tracking-tight text-slate-900 leading-tight">
            Crafted for Dental Students (BDS), Medical Students, Educators, and Doctors.
          </h3>
          <p className="text-sm text-slate-500 font-light">
            We skip boring slideshows in favor of clear visual learning, step-by-step guides, and a helpful interactive AI study assistant.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-panel rounded-3xl p-8 space-y-6 hover:shadow-2xl hover:translate-y-[-4px] transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold font-display text-slate-900 group-hover:text-purple-800 transition-colors">
                Anatomy Study Philosophy
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rather than just memorizing lists, learn with clear interactive guides. Trace every blood vessel and nerve path easily, just like in a real lab.
              </p>
            </div>
            <div className="pt-2 border-t border-purple-50">
              <span className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-wider">
                ACCREDITED EDUCATION →
              </span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel-darker rounded-3xl p-6 sm:p-8 space-y-6 hover:shadow-2xl hover:translate-y-[-4px] transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-200">
              <Heart className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold font-display text-slate-900 group-hover:text-rose-600 transition-colors">
                Cinematic Lecture Player
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Watch high-definition videos of actual anatomy structures paired with easy-to-read transcripts and study notes.
              </p>
            </div>
            <div className="pt-2 border-t border-rose-50">
              <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-wider">
                HD VIDEO PLAYBACK →
              </span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel rounded-3xl p-8 space-y-6 hover:shadow-2xl hover:translate-y-[-4px] transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-400 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-teal-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold font-display text-slate-900 group-hover:text-teal-700 transition-colors">
                Dr. Garg's AI Assistant
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ask our AI assistant, trained directly on Dr. Krishna Garg's textbooks. Get instant answers, translation helpers, and tissue details.
              </p>
            </div>
            <div className="pt-2 border-t border-teal-50">
              <span className="text-[10px] font-mono font-bold text-teal-600 uppercase tracking-wider">
                HELPFUL AI CHAT →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* LEGENDARY TEACHER / FACULTY SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 md:p-12 bg-gradient-to-br from-white/80 via-[#FFF8F3]/60 to-purple-50/20 border border-white/60 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-orange-500/5 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Faculty Image */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-tr from-purple-600 to-orange-500 rounded-2xl blur opacity-30 animate-pulse" />
                <div className="relative rounded-2xl w-52 h-52 sm:w-60 sm:h-60 md:w-64 md:h-64 bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center p-4 sm:p-6 text-center">
                  {!teacherImageError ? (
                    <img
                      src={mainTeacher.avatar}
                      alt={mainTeacher.name}
                      className="w-full h-full object-contain bg-slate-950"
                      style={{ objectPosition: "center top" }}
                      onError={() => setTeacherImageError(true)}
                    />
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                        <User className="w-10 h-10 text-slate-400" />
                      </div>
                      <div className="text-center">
                        <h5 className="text-xs font-bold text-white font-mono uppercase tracking-wider">{mainTeacher.name}</h5>
                        <p className="text-[10px] text-purple-300 font-mono mt-1">Photo Placeholder</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[9px] font-mono font-bold text-purple-700 uppercase tracking-widest bg-purple-50 px-2.5 py-1 rounded-full">
                MEET THE AUTHOR & CHIEF EDUCATOR
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold font-display text-slate-900 leading-tight">
                {mainTeacher.name}
              </h3>
              <p className="text-xs text-purple-700 font-medium font-mono uppercase tracking-wider -mt-3">
                {mainTeacher.role}
              </p>

              <p className="text-xs text-slate-600 leading-relaxed font-light">
                {mainTeacher.bio}
              </p>

              <div className="space-y-2 pt-2">
                <h5 className="text-[10px] font-bold font-mono text-slate-900 uppercase tracking-wider">
                  CELEBRATED ANATOMICAL TREATISES:
                </h5>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 font-light">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>BD Chaurasia's Human Anatomy (Lead Editor)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>Companion Pocketbook of Anatomy</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>Surgical Study Guide Manual</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>Clinical Embryology & Histology Atlas</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE TIMELINE / HISTORY SECTION */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 space-y-12">
        <div className="text-center max-w-lg mx-auto space-y-3">
          <span className="text-[10px] font-mono font-bold tracking-widest text-purple-600 uppercase">
            CHRONICLES OF MEDICAL LEADERSHIP
          </span>
          <h3 className="text-2xl font-extrabold font-display tracking-tight text-slate-900">
            A Legacy of Anatomy Teaching
          </h3>
        </div>

        {/* Timeline Line */}
        <div className="relative border-l border-purple-200 ml-2 sm:ml-4 md:ml-32 py-4 space-y-8 sm:space-y-12">
          {timelineEvents.map((ev, i) => (
            <div key={i} className="relative pl-8 group">
              {/* Timeline dot */}
              <div className="absolute -left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-purple-600 group-hover:bg-purple-600 group-hover:scale-110 transition-all shadow" />

              {/* Year indicator left */}
              <div className="md:absolute md:right-full md:mr-10 md:top-1.5 text-xs font-mono font-bold text-purple-700 tracking-wider">
                {ev.year}
              </div>

              <div className="glass-panel rounded-2xl p-5 hover:border-purple-300 transition-colors shadow-sm max-w-2xl">
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                  {ev.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1.5 font-display">
                  {ev.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-light">
                  {ev.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STUDENT TESTIMONIALS */}
      <section className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 space-y-8 sm:space-y-12">
        <div className="text-center max-w-lg mx-auto space-y-3">
          <span className="text-[10px] font-mono font-bold tracking-widest text-purple-600 uppercase">
            STUDENT TESTIMONIALS
          </span>
          <h3 className="text-2xl font-extrabold font-display tracking-tight text-slate-900">
            Endorsed by Medical Students Worldwide
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="glass-panel rounded-3xl p-5 sm:p-6 relative flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-purple-100/60 pointer-events-none" />
              <div className="space-y-4">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <span key={s} className="text-amber-400 text-xs">★</span>
                  ))}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-light italic">
                  "{t.text}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 mt-6 border-t border-purple-50">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-purple-100"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                  <p className="text-[9px] text-purple-700 font-mono tracking-wider font-semibold uppercase">
                    {t.role}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    {t.university}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE FAQ SECTION */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 space-y-12">
        <div className="text-center max-w-md mx-auto space-y-3">
          <span className="text-[10px] font-mono font-bold tracking-widest text-purple-600 uppercase">
            COMMON QUESTIONS
          </span>
          <h3 className="text-2xl font-extrabold font-display tracking-tight text-slate-900">
            Frequently Asked Questions
          </h3>
        </div>

        {/* Categories Tab */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {faqCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFaqCategory(cat);
                setActiveFaq(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-wider font-bold uppercase transition-all cursor-pointer ${
                faqCategory === cat
                  ? "bg-purple-900 text-white shadow-sm"
                  : "bg-purple-50 text-purple-900 border border-purple-100 hover:bg-purple-100/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion Questions */}
        <div className="space-y-3 max-w-2xl mx-auto">
          {filteredFaq.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl overflow-hidden border border-white/55 shadow-sm transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between text-slate-900 hover:text-purple-900 transition-colors cursor-pointer"
                >
                  <span className="text-xs md:text-sm font-semibold tracking-tight">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-purple-700 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-purple-50 bg-[#FFF8F3]/30">
                    <p className="text-xs text-slate-600 leading-relaxed font-light">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* MODERN COMPACT FOOTER */}
      <footer className="relative z-10 border-t border-purple-100 pt-10 sm:pt-12 mt-20 sm:mt-32">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
              K
            </div>
            <span className="text-[11px] font-bold tracking-wider text-slate-900 font-display uppercase">
              KRISHNA GARG ANATOMY
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[10px] text-slate-500 font-light">
            <button onClick={() => onNavigate("home")} className="hover:text-purple-700 transition-colors cursor-pointer">Home</button>
            <button onClick={() => onNavigate("courses")} className="hover:text-purple-700 transition-colors cursor-pointer">Study Materials</button>
            <button onClick={() => onNavigate("about")} className="hover:text-purple-700 transition-colors cursor-pointer">About Dr. Krishna Garg</button>
            <button onClick={() => onNavigate("contact")} className="hover:text-purple-700 transition-colors cursor-pointer">Contact Support</button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-3 sm:px-4 mt-8 pt-6 border-t border-purple-50 text-center text-[9px] font-mono text-slate-400 tracking-wider">
          © 2026 DR. KRISHNA GARG ANATOMY. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
}
