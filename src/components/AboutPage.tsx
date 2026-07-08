import React, { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, Award, CheckCircle2, Star, Quote, GraduationCap, Trophy, Landmark, ShieldAlert, User } from "lucide-react";
import { mainTeacher, timelineEvents, testimonials } from "../data";

export default function AboutPage() {
  const [teacherImageError, setTeacherImageError] = useState(false);
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-16 relative z-10">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-[10px] font-mono font-bold tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full uppercase">
          Department of Academic Pedagogy
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-slate-900 leading-none">
          Our Educational Philosophy
        </h2>
        <p className="text-sm text-slate-600 font-light leading-relaxed">
          Led by master author Dr. Krishna Garg, we aim to bridge the gap between abstract textbook pages and elite surgical theatre procedures.
        </p>
      </div>

      {/* Profile Section */}
      <section className="glass-panel rounded-3xl p-8 md:p-12 border border-white/60 shadow-xl overflow-hidden relative bg-white/80">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-orange-500/5 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Avatar frame */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-purple-600 to-orange-500 rounded-2xl blur opacity-30" />
              <div className="relative rounded-2xl w-60 h-60 bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center p-6 text-center">
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

          {/* Bio info */}
          <div className="md:col-span-7 space-y-5">
            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              Distinguished Educator & Scholar
            </span>
            <h3 className="text-2xl font-extrabold font-display text-slate-900 leading-tight">
              {mainTeacher.name}
            </h3>

            {/* Academic Credentials / Degrees Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(mainTeacher.credentials || []).map((cred) => (
                <span
                  key={cred}
                  className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-50 border border-teal-100 text-teal-800 uppercase tracking-wider"
                >
                  {cred}
                </span>
              ))}
            </div>

            <p className="text-xs text-purple-700 font-medium font-mono uppercase tracking-wider">
              {mainTeacher.role}
            </p>

            <p className="text-xs text-slate-600 leading-relaxed font-light">
              {mainTeacher.bio}
            </p>

            {/* Academic Positions & Affiliations */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <h5 className="text-[10px] font-bold font-mono text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-purple-600" />
                DISTINGUISHED ACADEMIC APPOINTMENTS:
              </h5>
              <ul className="space-y-1.5 text-[11px] text-slate-600 font-light">
                {(mainTeacher.positions || []).map((pos, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <span>{pos}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prestigious Recognitions & Achievements */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <h5 className="text-[10px] font-bold font-mono text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                LIFETIME ACHIEVEMENTS & FELLOWSHIPS:
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {(mainTeacher.recognitions || []).map((rec, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl text-[10px] font-medium bg-amber-50 border border-amber-200/60 text-amber-900 flex items-center gap-1 shadow-2xs"
                  >
                    <Award className="w-3 h-3 text-amber-500 shrink-0" />
                    {rec}
                  </span>
                ))}
              </div>
            </div>

            {/* Acclaimed Publications */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <h5 className="text-[10px] font-bold font-mono text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-600" />
                ACCLAIMED TEXTBOOKS & PUBLICATIONS:
              </h5>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 font-light">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>B.D. Chaurasia's Human Anatomy (9th Edition)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Textbook of Histology</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Textbook of Neuroanatomy & Embryology</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Anatomy for Dental & Nursing Students</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="space-y-8">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold font-display text-slate-900">
            A Chronology of Innovation
          </h3>
          <p className="text-xs text-slate-500 font-light">
            Highlighting decades of clinical contributions and anatomical handbooks.
          </p>
        </div>

        <div className="relative border-l border-purple-200 ml-4 md:ml-32 py-4 space-y-10">
          {timelineEvents.map((ev, i) => (
            <div key={i} className="relative pl-8 group">
              <div className="absolute -left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-purple-600 group-hover:bg-purple-600 group-hover:scale-110 transition-all shadow" />
              <div className="md:absolute md:right-full md:mr-10 md:top-1.5 text-xs font-mono font-bold text-purple-700 tracking-wider">
                {ev.year}
              </div>
              <div className="glass-panel rounded-2xl p-5 hover:border-purple-300 transition-colors shadow-sm bg-white/60">
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                  {ev.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-1.5 font-display">
                  {ev.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-light">
                  {ev.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="space-y-8">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold font-display text-slate-900">
            Resonating with Scholars Globally
          </h3>
          <p className="text-xs text-slate-500 font-light">
            Read comments from physicians, ortho-surgeons, and academic researchers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="glass-panel rounded-3xl p-6 relative flex flex-col justify-between hover:shadow-lg transition-all bg-white/70"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-purple-100/50 pointer-events-none" />
              <div className="space-y-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <span key={s} className="text-amber-400 text-xs">★</span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-light italic">
                  "{t.text}"
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-4 mt-6 border-t border-purple-50">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-8 h-8 rounded-full object-cover border border-purple-100"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-[10px] font-bold text-slate-900">{t.name}</h4>
                  <p className="text-[8px] text-purple-700 font-mono font-semibold uppercase leading-tight">
                    {t.role}
                  </p>
                  <p className="text-[8px] text-slate-400 font-mono leading-none">
                    {t.university}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
