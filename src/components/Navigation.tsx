import React from "react";
import { motion } from "motion/react";
import { Activity, Film, UploadCloud, Sparkles, Trophy, ShieldCheck, LogIn, LogOut, User, BookOpen, Mail } from "lucide-react";

interface NavigationProps {
  activeTab: "home" | "about" | "contact" | "courses" | "upload" | "admin" | "auth";
  setActiveTab: (tab: "home" | "about" | "contact" | "courses" | "upload" | "admin" | "auth") => void;
  onOpenAI: () => void;
  user: { uid: string; email: string | null; name: string; role: "student" | "admin" } | null;
  onLogout: () => void;
}

export default function Navigation({ 
  activeTab, 
  setActiveTab, 
  onOpenAI, 
  user,
  onLogout
}: NavigationProps) {
  
  // Dynamic tabs based on auth and role
  const navItems = [
    { id: "home", label: "Home", icon: Activity },
    { id: "about", label: "About", icon: BookOpen },
    { id: "contact", label: "Contact", icon: Mail },
    ...(user ? [{ id: "courses", label: "Study Materials", icon: Film }] : []),
    ...(user && user.role === "admin" ? [{ id: "admin", label: "Teacher Panel", icon: ShieldCheck }] : [])
  ] as const;


  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-3 z-40 w-full max-w-5xl mx-auto px-2 sm:px-4"
    >
      <div className="glass-nav rounded-2xl px-2.5 py-2.5 sm:px-6 sm:py-3.5 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between shadow-lg shadow-purple-950/5 border border-white/50 relative overflow-visible">
        {/* Ambient background accent */}
        <div className="absolute top-0 right-1/4 w-32 h-6 bg-gradient-to-r from-purple-500/10 to-orange-500/5 blur-xl pointer-events-none" />

        {/* Brand Logo & Name */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-all">
              K
            </div>
            <div>
              <h1 className="text-xs font-bold font-display tracking-wider text-slate-900 uppercase group-hover:text-purple-700 transition-colors">
                KRISHNA GARG
              </h1>
              <p className="text-[9px] font-mono tracking-widest text-slate-400 font-bold uppercase">
                Anatomy Portal
              </p>
            </div>
          </div>
        </div>

        {/* Center Tabs Grid */}
        <nav className="w-full md:w-auto">
          <div className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-200/40 p-1 rounded-2xl border border-white/20 md:w-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className="relative flex-1 min-w-[110px] sm:min-w-0 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 bg-white shadow-sm border border-slate-100 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  className={`w-3.5 h-3.5 z-10 transition-colors ${
                    isActive ? "text-purple-600" : "text-slate-500"
                  }`}
                />
                <span
                  className={`z-10 text-[10px] sm:text-[11px] font-medium tracking-tight transition-colors ${
                    isActive ? "text-purple-950 font-semibold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
          </div>
        </nav>

        {/* Right side stats & widgets */}
        <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-4 w-full md:w-auto">
          {/* Dr. Garg AI Trigger Pill */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 bg-gradient-to-tr from-purple-600 to-purple-800 text-white rounded-full px-2.5 sm:px-3.5 py-1.5 text-[9px] sm:text-[10px] font-medium tracking-tight shadow-md hover:shadow-purple-500/15 cursor-pointer hover:scale-[1.03] transition-all"
          >
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>AI Helper</span>
          </button>

          {/* Profile indicator */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[10px] font-bold text-slate-800 leading-none truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[8px] font-mono text-purple-600 font-bold uppercase tracking-wider mt-0.5">
                    {user.role === "admin" ? "Teacher" : "Student"}
                  </span>
                </div>
                
                <div className="relative group">
                  <button 
                    onClick={onLogout}
                    className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("auth")}
                className="flex items-center gap-1 bg-slate-100 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-full px-2.5 sm:px-3 py-1.5 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 hover:text-purple-900 cursor-pointer transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>SIGN IN</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
