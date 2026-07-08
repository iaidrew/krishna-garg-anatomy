import React, { useState } from "react";
import { motion } from "motion/react";
import { Trophy, Clock, Play, BookOpen, Calendar, Bell, ChevronRight, Award, Flame, FlameKindling, CheckCircle2, Bookmark, Heart } from "lucide-react";
import { dashboardStats, mainTeacher } from "../data";
import { Course } from "../types";

interface DashboardProps {
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
  onOpenAI: () => void;
  streak: number;
}

export default function Dashboard({ courses, onSelectCourse, onOpenAI, streak }: DashboardProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const totalDaysInMonth = 30;

  // Mock grid for the complex learning heatmap (30 days of study)
  const heatmapData = [
    { day: 1, level: 3, hrs: "3.5h" }, { day: 2, level: 4, hrs: "4.2h" }, { day: 3, level: 0, hrs: "0h" },
    { day: 4, level: 1, hrs: "0.8h" }, { day: 5, level: 2, hrs: "2.1h" }, { day: 6, level: 4, hrs: "5.0h" },
    { day: 7, level: 3, hrs: "3.2h" }, { day: 8, level: 2, hrs: "1.8h" }, { day: 9, level: 0, hrs: "0h" },
    { day: 10, level: 4, hrs: "6.1h" }, { day: 11, level: 3, hrs: "3.0h" }, { day: 12, level: 1, hrs: "1.2h" },
    { day: 13, level: 2, hrs: "2.5h" }, { day: 14, level: 4, hrs: "4.8h" }, { day: 15, level: 3, hrs: "3.6h" },
    { day: 16, level: 4, hrs: "5.5h" }, { day: 17, level: 3, hrs: "3.2h" }, { day: 18, level: 1, hrs: "0.5h" },
    { day: 19, level: 0, hrs: "0h" }, { day: 20, level: 2, hrs: "2.0h" }, { day: 21, level: 3, hrs: "3.8h" },
    { day: 22, level: 4, hrs: "4.9h" }, { day: 23, level: 3, hrs: "3.4h" }, { day: 24, level: 2, hrs: "1.5h" },
    { day: 25, level: 1, hrs: "0.9h" }, { day: 26, level: 0, hrs: "0h" }, { day: 27, level: 4, hrs: "5.2h" },
    { day: 28, level: 3, hrs: "3.1h" }, { day: 29, level: 2, hrs: "2.2h" }, { day: 30, level: 4, hrs: "4.5h" }
  ];

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 0: return "bg-slate-100 border-slate-200/40 hover:bg-slate-200";
      case 1: return "bg-purple-100 border-purple-200/50 hover:bg-purple-200";
      case 2: return "bg-purple-300 border-purple-400/50 hover:bg-purple-400";
      case 3: return "bg-purple-500 border-purple-600/50 hover:bg-purple-600";
      case 4: return "bg-purple-700 border-purple-800/50 hover:bg-purple-800";
      default: return "bg-slate-100";
    }
  };

  const activeDayDetails = heatmapData.find(d => d.day === selectedDay) || { hrs: "0h", level: 0 };

  // Upcoming scheduled lectures for the calendar widget
  const upcomingLectures = [
    { date: "July 3", time: "10:00 AM", title: "Cranial Fossa Anatomical Boundaries", duration: "1h 30m" },
    { date: "July 7", time: "2:00 PM", title: "Temporomandibular Joint & Jaw Movements", duration: "2h 00m" },
    { date: "July 12", time: "11:00 AM", title: "Nerve Block Techniques & Local Anesthesia", duration: "1h 15m" }
  ];

  // Unlocked anatomical achievements
  const achievements = [
    { name: "Synapse Seeker", desc: "Completed 5 neuroanatomy lectures", color: "from-purple-500 to-purple-700", icon: Trophy },
    { name: "Cardiac Curator", desc: "Scored 100% on Heart Chambers quiz", color: "from-rose-400 to-orange-500", icon: Heart },
    { name: "Osteology Initiate", desc: "Mapped all sutures of cranial base", color: "from-teal-400 to-cyan-500", icon: Award }
  ];

  // Continue watching quick calculations
  const inProgressCourses = courses.filter(c => c.progress > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 relative z-10">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl p-8 bg-gradient-to-r from-white/70 via-[#FFF8F3]/60 to-purple-50/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md border border-white/50 relative overflow-hidden">
        {/* Ambient glow decoration */}
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-orange-700 uppercase">
              STUDENT PROFILE ACTIVE
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            My Study Dashboard
          </h2>
          <p className="text-xs text-slate-500 max-w-md font-light">
            Welcome back! Keep up the great work. Check your weekly progress and continue your anatomy lessons below.
          </p>
        </div>

        {/* Big Statistics indicators */}
        <div className="flex items-center gap-6 divide-x divide-purple-100">
          <div className="text-center pl-4 first:pl-0">
            <h3 className="text-2xl font-black font-mono text-purple-900 leading-none">{streak}</h3>
            <p className="text-[9px] font-mono text-slate-500 tracking-wider uppercase mt-1">Study Streak</p>
          </div>
          <div className="text-center pl-4">
            <h3 className="text-2xl font-black font-mono text-purple-900 leading-none">{dashboardStats.totalHours}</h3>
            <p className="text-[9px] font-mono text-slate-500 tracking-wider uppercase mt-1">Study Hours</p>
          </div>
          <div className="text-center pl-4">
            <h3 className="text-2xl font-black font-mono text-purple-900 leading-none">
              {dashboardStats.lecturesCompleted}
            </h3>
            <p className="text-[9px] font-mono text-slate-500 tracking-wider uppercase mt-1">Modules Passed</p>
          </div>
        </div>
      </div>

      {/* Primary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: HEATMAP, QUICK RESUME, ACHIEVEMENT */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Interactive Heatmap Grid */}
          <div className="glass-panel rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-bold font-display text-slate-900">Anatomical Heatmap</h3>
                <p className="text-[10px] font-mono text-slate-500">Clinical study consistency grid (30 days)</p>
              </div>

              {/* Status pill for active day */}
              <div className="bg-purple-50 border border-purple-100 px-3 py-1 rounded-xl flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                <span className="text-[9px] font-mono font-bold text-purple-700 uppercase">
                  Day {selectedDay}: {activeDayDetails.hrs} study hours
                </span>
              </div>
            </div>

            {/* Micro grid of 30 boxes */}
            <div className="space-y-4">
              <div className="grid grid-cols-10 gap-2.5">
                {heatmapData.map((d) => (
                  <button
                    key={d.day}
                    onClick={() => setSelectedDay(d.day)}
                    className={`h-9 rounded-xl border text-[10px] font-mono font-bold transition-all duration-150 relative cursor-pointer ${getHeatmapColor(
                      d.level
                    )} ${
                      selectedDay === d.day
                        ? "ring-2 ring-purple-600 scale-105 border-purple-600 text-white"
                        : "text-slate-600"
                    }`}
                  >
                    {d.day}
                  </button>
                ))}
              </div>

              {/* Grid Legend */}
              <div className="flex items-center justify-between pt-2 text-[9px] text-slate-400 font-mono">
                <span>0h (Inoperative)</span>
                <div className="flex items-center gap-1">
                  <span>Intensity:</span>
                  <div className="w-2.5 h-2.5 rounded bg-purple-100" />
                  <div className="w-2.5 h-2.5 rounded bg-purple-300" />
                  <div className="w-2.5 h-2.5 rounded bg-purple-500" />
                  <div className="w-2.5 h-2.5 rounded bg-purple-700" />
                </div>
                <span>6h+ (Critical)</span>
              </div>
            </div>
          </div>

          {/* 2. Continue Watching (Netflix style course continuation) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold font-mono text-purple-900 uppercase tracking-widest">
              CONTINUE LEARNING
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {inProgressCourses.map((course) => (
                <div
                  key={course.id}
                  className="glass-panel rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col justify-between h-44 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />

                  <div className="space-y-2">
                    <span className="text-[8px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {course.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight font-display">
                      {course.title}
                    </h4>
                  </div>

                  <div className="space-y-3 pt-4">
                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                        <span>Completed {course.progress}%</span>
                        <span>{course.lectures.length} Lectures</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-700 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Resume CTA */}
                    <button
                      onClick={() => onSelectCourse(course.id)}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 shadow-sm group-hover:scale-[1.01] transition-transform cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Resume Lesson
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CIRCULAR PROGRESS, CALENDAR, ANNOUNCEMENTS */}
        <div className="lg:col-span-4 space-y-8">
          {/* 1. Circular Today's Progress */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4">
            <h3 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest">
              TODAY'S STUDY PROGRESS
            </h3>

            {/* SVG Circular Ring */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(124, 58, 237, 0.08)"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Active progress */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#progress-ring-gradient)"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - dashboardStats.todayProgress / 100)}`}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="progress-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#FF6B6B" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Inner Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black font-mono text-purple-950 leading-none">
                  {dashboardStats.todayProgress}%
                </span>
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                  Completed
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 font-light max-w-[200px]">
              You have completed 3.2 hours of head and neck study today. 45 mins left for your daily target goal.
            </p>
          </div>

          {/* 2. Mock Calendar / Scheduled Lectures */}
          <div className="glass-panel-darker rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-700" />
              <h3 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-widest">
                UPCOMING STUDY CLASSES
              </h3>
            </div>

            <div className="space-y-3">
              {upcomingLectures.map((ev, i) => (
                <div
                  key={i}
                  className="bg-white/60 border border-purple-50 rounded-xl p-3 flex items-start gap-3 hover:border-purple-200 transition-colors"
                >
                  <div className="bg-purple-100/50 rounded-lg p-1.5 text-center w-12 shrink-0">
                    <span className="block text-[8px] font-bold font-mono uppercase text-purple-700 leading-none">
                      {ev.date.split(" ")[0]}
                    </span>
                    <span className="block text-[11px] font-black font-mono text-purple-950 leading-none mt-1">
                      {ev.date.split(" ")[1]}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-[11px] font-bold text-slate-900 leading-tight">
                      {ev.title}
                    </h4>
                    <p className="text-[9px] font-mono text-slate-400">
                      {ev.time} ({ev.duration})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Unlocked Medals Achievements */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-700" />
              <h3 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-widest">
                STUDY MEDALS UNLOCKED
              </h3>
            </div>

            <div className="space-y-3">
              {achievements.map((ach) => {
                const Icon = ach.icon;
                return (
                  <div key={ach.name} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${ach.color} flex items-center justify-center text-white shadow`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-900">{ach.name}</h4>
                      <p className="text-[9px] text-slate-400 font-mono">{ach.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ANNOUNCEMENT BOARD ROW */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold font-mono text-purple-900 uppercase tracking-widest">
          FACULTY NOTICES & ANNOUNCEMENTS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardStats.announcements.map((ann) => (
            <div
              key={ann.id}
              className="glass-panel rounded-2xl p-5 border border-white/50 bg-[#FFF8F3]/50 relative"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono text-slate-400">{ann.date}</span>
                <span className="text-[8px] font-mono bg-purple-50 text-purple-800 border border-purple-100 px-2 py-0.5 rounded">
                  NEW MATERIAL
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1 leading-snug">{ann.title}</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-light">{ann.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
