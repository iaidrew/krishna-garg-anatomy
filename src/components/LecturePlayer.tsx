import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, ChevronRight, BookOpen, Volume2, FastForward, Maximize, Landmark, CheckCircle2, FileText, Bookmark, Clock, ArrowLeft, Send, Sparkles, AlertCircle, X, Eye, Type, Download, Moon, Sun, Check, ExternalLink } from "lucide-react";
import { Course, Lecture, TimestampNote } from "../types";

interface LecturePlayerProps {
  courses: Course[];
  onOpenAI: () => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  activeLectureIdx: number;
  setActiveLectureIdx: (idx: number) => void;
}

export default function LecturePlayer({
  courses,
  onOpenAI,
  selectedCourseId,
  setSelectedCourseId,
  activeLectureIdx,
  setActiveLectureIdx
}: LecturePlayerProps) {
  // Course Selector states
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(80);
  const [activeTab, setActiveTab] = useState<"transcript" | "notes">("notes");

  // Interaction states
  const [newNoteText, setNewNoteText] = useState("");
  const [customNotes, setCustomNotes] = useState<TimestampNote[]>([]);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const coursesCategories = ["All", "Neuroanatomy", "Cardiovascular", "Osteology"];

  const isYouTubeUrl = (url: string) => {
    if (!url) return false;
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("/embed/")) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`;
    }
    return url;
  };

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const videoLectures = currentCourse?.lectures?.filter(l => l.videoUrl && l.videoUrl.trim() !== "") || [];
  const documentLectures = currentCourse?.lectures?.filter(l => !l.videoUrl || l.videoUrl.trim() === "") || [];
  
  const activeLecture = videoLectures.length > 0 
    ? (videoLectures[activeLectureIdx] || videoLectures[0]) 
    : (currentCourse?.lectures?.[0]);

  // Set initial notes for lecture
  useEffect(() => {
    if (activeLecture) {
      setCustomNotes(activeLecture.notes || []);
      setCurrentTime(0);
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  }, [activeLectureIdx, selectedCourseId]);

  // Video playback listeners
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch((err) => console.log("Video Play Blocked:", err));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const val = parseFloat(e.target.value);
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleSpeedChange = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currIdx = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currIdx + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val / 100;
    }
  };

  const jumpToSeconds = (secs: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = secs;
      setCurrentTime(secs);
      if (!isPlaying) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  // Timestamp Note-taking logic
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const mins = Math.floor(currentTime / 60);
    const secs = Math.floor(currentTime % 60);
    const timestampStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

    const newNote: TimestampNote = {
      time: timestampStr,
      seconds: Math.floor(currentTime),
      text: newNoteText,
    };

    setCustomNotes((prev) => [...prev, newNote].sort((a, b) => a.seconds - b.seconds));
    setNewNoteText("");
  };

  const createAttachmentBlob = async (name: string): Promise<Blob> => {
    const globalRegistry = (window as any).gargUploadedFiles || {};
    const cachedFile = globalRegistry[name];

    if (cachedFile && (cachedFile instanceof File || cachedFile instanceof Blob)) {
      return cachedFile;
    }

    const response = await fetch(`/api/download/${encodeURIComponent(name)}`);
    if (!response.ok) {
      throw new Error(`The uploaded file "${name}" is no longer available on the server. Please re-upload it.`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      throw new Error(`The file service returned an HTML page instead of "${name}". Please run the Express dev server, not a static preview.`);
    }

    return response.blob();
  };

  // Streamlined viewer for opening files/attachments directly
  const handleOpenAttachment = async (name: string) => {
    try {
      const blob = await createAttachmentBlob(name);
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    } catch (error) {
      console.warn("Attachment open failed:", error);
      setSuccessNotification(error instanceof Error ? error.message : `Unable to open "${name}" right now.`);
      setTimeout(() => setSuccessNotification(null), 5000);
    }
  };

  // Trigger real physical file downloads on client devices
  const handleDownload = async (name: string) => {
    setIsDownloading(name);

    try {
      const blob = await createAttachmentBlob(name);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      setSuccessNotification(`Successfully downloaded "${name}" to your device.`);
      setTimeout(() => setSuccessNotification(null), 4000);
      setIsDownloading(null);
    } catch (error) {
      console.warn("Attachment download failed:", error);
      setSuccessNotification(error instanceof Error ? error.message : `Unable to prepare "${name}" for download right now.`);
      setTimeout(() => setSuccessNotification(null), 5000);
      setIsDownloading(null);
    }
  };

  // Duration Formatter Helper
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Filtered Courses List
  const filteredCourses =
    activeCategory === "All"
      ? courses
      : courses.filter((c) => c.category === activeCategory);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
      <AnimatePresence mode="wait">
        {!selectedCourseId ? (
          /* ==========================================
             SCREEN A: NETFLIX-INSPIRED COURSE BROWSER
             ========================================== */
          <motion.div
            key="browser"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            {/* Header Title */}
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span className="text-[10px] font-mono font-bold tracking-widest text-purple-600 uppercase bg-purple-50 px-3 py-1 rounded-full">
                ANATOMY LECTURE PORTAL
              </span>
              <h2 className="text-3xl font-extrabold font-display tracking-tight text-slate-900 leading-none">
                Anatomy Course Library
              </h2>
              <p className="text-xs text-slate-500 font-light">
                Browse our easy-to-follow learning courses. Click any course to launch the interactive video player.
              </p>
            </div>

            {/* Category Filter bar */}
            <div className="flex flex-wrap justify-center gap-1.5 border-b border-purple-50 pb-6">
              {coursesCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-purple-950 text-white shadow"
                      : "bg-[#FFF2E8] text-purple-900 hover:bg-purple-100/50"
                  }`}
                >
                  {cat === "Neuroanatomy" ? "Brain Anatomy" : cat === "Cardiovascular" ? "Heart Anatomy" : cat === "Osteology" ? "Skeletal Anatomy" : cat}
                </button>
              ))}
            </div>

            {/* Netflix Cards Grid */}
            {filteredCourses.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto text-purple-700 shadow-inner">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold font-display text-slate-800 uppercase tracking-wide">
                    No Courses Available Yet
                  </h3>
                  <p className="text-xs text-slate-500 font-light leading-relaxed">
                    No study lectures have been added by the teachers yet.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-mono text-purple-600 font-bold uppercase tracking-wider">
                  Verified teachers can log in to upload study guides and lectures in the Teacher Suite.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className="group relative cursor-pointer glass-panel rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] border border-white/60"
                  >
                    {/* Top Gradient Overlay */}
                    <div className="relative h-48 overflow-hidden bg-slate-50">
                      {course.image && course.image.trim() !== "" ? (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-purple-950 flex flex-col items-center justify-center p-6 text-center select-none">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2.5 text-purple-300">
                            {course.category === "Neuroanatomy" ? (
                              <BookOpen className="w-6 h-6 stroke-[1.5]" />
                            ) : (
                              <FileText className="w-6 h-6 stroke-[1.5]" />
                            )}
                          </div>
                          <span className="text-[9px] font-mono font-bold text-purple-300 uppercase tracking-widest">{course.category}</span>
                          <span className="text-xs font-bold text-white font-display mt-1 leading-tight line-clamp-2 max-w-[200px]">{course.title}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                      {/* Quick overlay badges */}
                      <span className="absolute top-4 left-4 bg-purple-900/90 text-white text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-md backdrop-blur-sm tracking-wide">
                        {course.category === "Neuroanatomy" ? "Brain Anatomy" : course.category === "Cardiovascular" ? "Heart Anatomy" : course.category === "Osteology" ? "Skeletal Anatomy" : course.category}
                      </span>

                      <span className="absolute bottom-4 left-4 text-[10px] font-mono font-bold text-teal-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        {course.duration}
                      </span>
                    </div>

                    {/* Card Content body */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold">
                        <span className="text-purple-700">{course.lecturesCount} LECTURES</span>
                        <span>{course.studentsCount} STUDENTS</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 font-display line-clamp-2 leading-snug group-hover:text-purple-800 transition-colors">
                        {course.title}
                      </h3>

                      <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed font-light">
                        {course.description}
                      </p>

                      {/* Progress tracking */}
                      {course.progress > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-purple-50">
                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                            <span>Progress</span>
                            <span>{course.progress}% Completed</span>
                          </div>
                          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-purple-700 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Teacher / Instructor row */}
                      <div className="flex items-center justify-between pt-3 border-t border-purple-50">
                        <div className="flex items-center gap-2">
                          <img
                            src={course.teacher.avatar}
                            alt={course.teacher.name}
                            className="w-7 h-7 rounded-full object-cover border border-purple-100"
                            referrerPolicy="no-referrer"
                          />
                          <div className="leading-none">
                            <h4 className="text-[10px] font-bold text-slate-800">{course.teacher.name}</h4>
                            <span className="text-[8px] text-purple-700 font-mono">Chief Editor & Former HOD</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-amber-500 font-bold font-mono">★ {course.rating}</span>
                          <p className="text-[8px] text-slate-400 font-mono uppercase">Rating Index</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (!currentCourse || !activeLecture) ? (
          <motion.div
            key="empty-cinema"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto text-purple-700">
              <BookOpen className="w-8 h-8" />
            </div>
            <p className="text-xs text-slate-500 font-light leading-relaxed">This course folder does not have any lectures registered yet.</p>
            <button 
              onClick={() => setSelectedCourseId(null)} 
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-[10px] font-mono font-bold uppercase rounded-xl hover:scale-105 transition-all cursor-pointer"
            >
              Return to Catalog
            </button>
          </motion.div>
        ) : (
          /* ==========================================
             SCREEN B: DUAL-SECTION CLINICAL THEATER
             ========================================== */
          <motion.div
            key="cinema"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="space-y-12"
          >
            {/* Breadcrumbs navigation header */}
            <div className="flex items-center justify-between pb-4 border-b border-purple-100">
              <button
                onClick={() => setSelectedCourseId(null)}
                className="flex items-center gap-1.5 text-xs font-medium text-purple-950 hover:text-purple-700 bg-white border border-purple-100 hover:border-purple-300 rounded-xl px-4 py-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Course Library
              </button>

              <div className="text-right">
                <span className="text-[9px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded uppercase">ACTIVE COURSE:</span>
                <h3 className="text-xs font-bold text-slate-900 font-display truncate max-w-sm mt-1">
                  {currentCourse.title}
                </h3>
              </div>
            </div>

            {/* Check if course has zero video lectures. If so, display a clean Document Portal. */}
            {videoLectures.length === 0 ? (
              <div className="space-y-8 animate-fade-in">
                {/* Clean Folder Header */}
                <div className="glass-panel border-l-4 border-teal-500 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-white/90 via-teal-50/20 to-teal-100/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono font-bold text-teal-800 bg-teal-50/80 border border-teal-100 px-2.5 py-1 rounded-full uppercase tracking-widest">
                      📁 Document Directory Active
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 font-display tracking-tight leading-none">
                      {currentCourse.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-light max-w-2xl leading-relaxed">
                      {currentCourse.description}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                      {documentLectures.length} Document Folders
                    </span>
                  </div>
                </div>

                {successNotification && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm font-mono animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{successNotification}</span>
                  </div>
                )}

                {/* Main Documents Grid */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-purple-50 pb-3">
                    <h4 className="text-xs font-bold font-mono text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                      Academic Lectures, PDFs & Syllabus Files
                    </h4>
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Click download to save files</span>
                  </div>

                  {documentLectures.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 max-w-xl mx-auto space-y-3">
                      <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-xs font-light">No documents or handouts have been published inside this folder yet.</p>
                      <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">
                        Admins can add written syllabus material under the Administrator Panel.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {documentLectures.map((doc, dIdx) => (
                        <div key={doc.id} className="bg-white/80 border border-purple-100/50 hover:border-teal-200 rounded-3xl p-6 shadow-sm transition-all hover:shadow-md space-y-4">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="space-y-1">
                              <span className="text-[8px] font-mono font-black text-teal-800 bg-teal-50 px-2 py-0.5 rounded uppercase">
                                Document Unit {dIdx + 1}
                              </span>
                              <h4 className="text-sm font-black text-slate-900 font-display mt-1">
                                {doc.title}
                              </h4>
                              <p className="text-xs text-slate-500 font-light leading-relaxed max-w-3xl">
                                {doc.description}
                              </p>
                            </div>

                            {doc.password && (
                              <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-amber-100">
                                🔒 Passcode Secured
                              </span>
                            )}
                          </div>

                          {/* Render resources of this document lecture */}
                          {doc.resources && doc.resources.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-purple-50/50">
                              {doc.resources.map((res) => (
                                <div
                                  key={res.name}
                                  className="bg-white hover:bg-slate-50 border border-teal-50/50 hover:border-teal-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs transition-all hover:-translate-y-0.5"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-mono text-[10px] font-black border border-teal-100/30 shrink-0">
                                      {res.type}
                                    </div>
                                    <div className="min-w-0">
                                      <h5 className="text-[11px] font-bold text-slate-800 truncate max-w-[150px] sm:max-w-[200px]" title={res.name}>
                                        {res.name}
                                      </h5>
                                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{res.size}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      onClick={() => handleOpenAttachment(res.name)}
                                      className="text-[9px] font-mono font-bold text-purple-800 hover:text-purple-950 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-100/50 transition-all cursor-pointer shadow-xs"
                                    >
                                      VIEW / OPEN
                                    </button>
                                    <button
                                      onClick={() => handleDownload(res.name)}
                                      disabled={isDownloading !== null}
                                      className="text-[9px] font-mono font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-100/50 transition-all cursor-pointer shadow-xs disabled:opacity-40"
                                    >
                                      {isDownloading === res.name ? "PROCESSING..." : "DOWNLOAD"}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400 italic font-light pt-2 border-t border-purple-50/50">No attachments linked inside this unit.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* SECTION 1: VIDEO LECTURES & STUDY SPACE */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-l-4 border-purple-600 pl-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-purple-700 bg-purple-50 px-2 py-0.5 rounded uppercase">SECTION 1</span>
                    <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-800">
                      Video Lesson Player & Course Playlist
                    </h3>
                  </div>

              {/* Theater Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* VIDEO STREAM & CONTROLS CENTER */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Cinema Canvas Screen */}
                  <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-900 group">
                    {isYouTubeUrl(activeLecture.videoUrl) ? (
                      <iframe
                         src={getYouTubeEmbedUrl(activeLecture.videoUrl)}
                        title={activeLecture.title}
                        className="w-full h-full border-0 rounded-3xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <video
                          ref={videoRef}
                          src={activeLecture.videoUrl}
                          className="w-full h-full object-cover"
                          onTimeUpdate={handleTimeUpdate}
                          onClick={togglePlay}
                        />

                        {/* Playback Dark overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-6">
                          {/* Top status */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded-md backdrop-blur-sm border border-teal-500/20">
                              HD VIDEO LESSON
                            </span>
                            <span className="text-[10px] font-mono text-slate-300">
                              Speed: {playbackSpeed}x
                            </span>
                          </div>

                          {/* Big Center Play Icon */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-all shadow-xl">
                              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                            </button>
                          </div>

                          {/* Bottom Custom Playback Bar */}
                          <div className="space-y-4">
                            {/* Timeline Slider */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(activeLecture.seconds)}</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max={activeLecture.seconds}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full accent-purple-500 cursor-pointer h-1 rounded-full bg-white/20"
                              />
                            </div>

                            {/* Controls Row */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {/* Play/Pause Button */}
                                <button
                                  onClick={togglePlay}
                                  className="text-white hover:text-purple-400 transition-colors cursor-pointer"
                                >
                                  {isPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 fill-current" />}
                                </button>

                                {/* Speed Toggle */}
                                <button
                                  onClick={handleSpeedChange}
                                  className="text-[10px] font-mono font-bold text-white hover:text-purple-400 bg-white/10 px-2 py-0.5 rounded border border-white/20 transition-all cursor-pointer"
                                >
                                  {playbackSpeed}x SPEED
                                </button>

                                {/* Volume Slider */}
                                <div className="flex items-center gap-1.5">
                                  <Volume2 className="w-4 h-4 text-slate-300" />
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-16 accent-white cursor-pointer h-1 bg-white/20 rounded"
                                  />
                                </div>
                              </div>

                              {/* Fullscreen Button */}
                              <button
                                onClick={() => {
                                  if (videoRef.current?.requestFullscreen) {
                                    videoRef.current.requestFullscreen();
                                  }
                                }}
                                className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                              >
                                <Maximize className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Video Info Card */}
                  <div className="space-y-2 bg-white/80 p-6 rounded-3xl border border-purple-50">
                    <span className="text-[9px] font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                      LECTURE {activeLectureIdx + 1} OF {currentCourse.lectures.length}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 font-display">
                      {activeLecture.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-light">
                      {activeLecture.description}
                    </p>
                  </div>

                  {/* CINEMA TABBED INTERACTIVE CONTROLS */}
                  <div className="glass-panel rounded-3xl p-6 space-y-6">
                    {/* Custom Tab Toggles */}
                    <div className="flex items-center border-b border-purple-50 pb-4 justify-between flex-wrap gap-2">
                      <div className="flex items-center bg-slate-200/40 p-1 rounded-full border border-white/20">
                        {[
                          { id: "notes", label: "Interactive Bookmarks", icon: Bookmark },
                          { id: "transcript", label: "Lecture Transcript", icon: FileText },
                        ].map((tb) => {
                          const Icon = tb.icon;
                          const isTabActive = activeTab === tb.id;
                          return (
                            <button
                              key={tb.id}
                              onClick={() => setActiveTab(tb.id as any)}
                              className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer`}
                            >
                              {isTabActive && (
                                <motion.div
                                  layoutId="active-cinema-tab"
                                  className="absolute inset-0 bg-white shadow-sm rounded-full border border-purple-50"
                                />
                              )}
                              <Icon className={`w-3.5 h-3.5 z-10 ${isTabActive ? "text-purple-600" : "text-slate-500"}`} />
                              <span className={`z-10 text-[10px] font-mono font-bold uppercase tracking-wider ${isTabActive ? "text-purple-900" : "text-slate-600"}`}>
                                {tb.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">
                        ACTIVE STUDY UNIT: {activeTab.toUpperCase()}
                      </span>
                    </div>

                    {/* TAB DISPLAY CANVAS */}
                    <div className="min-h-[160px] bg-white/30 rounded-2xl p-4 border border-white/40">
                      {activeTab === "notes" && (
                        <div className="space-y-6">
                          {/* Note Entry form */}
                          <form onSubmit={handleAddNote} className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={newNoteText}
                              onChange={(e) => setNewNoteText(e.target.value)}
                              placeholder={`Take a personal study note at ${formatTime(currentTime)}...`}
                              className="flex-1 bg-white border border-purple-100 focus:border-purple-300 focus:ring-1 focus:ring-purple-300 rounded-xl px-4 py-2 text-xs outline-none"
                            />
                            <button
                              type="submit"
                              disabled={!newNoteText.trim()}
                              className="bg-gradient-to-tr from-purple-600 to-purple-800 text-white rounded-xl px-4 py-2 text-xs font-mono font-bold uppercase disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                            >
                              <Bookmark className="w-3 h-3" />
                              Pin Note
                            </button>
                          </form>

                          {/* Saved Notes Log */}
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">
                              MY BOOKMARKS ({customNotes.length})
                            </h4>

                            {customNotes.length === 0 ? (
                              <p className="text-[11px] text-slate-400 italic font-light">No custom bookmarks mapped yet. Type above to pin study coordinates to the timeline.</p>
                            ) : (
                              <div className="space-y-2">
                                {customNotes.map((nt, nIdx) => (
                                  <div
                                    key={nIdx}
                                    onClick={() => jumpToSeconds(nt.seconds)}
                                    className="bg-white hover:bg-purple-50/40 border border-purple-50 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                        <Clock className="w-2.5 h-2.5" />
                                        {nt.time}
                                      </span>
                                      <span className="text-xs text-slate-700 font-light">{nt.text}</span>
                                    </div>
                                    <span className="text-[8px] font-mono text-slate-400 font-bold">JUMP TO SCENE →</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === "transcript" && (
                        <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                          {activeLecture.transcript && activeLecture.transcript.length > 0 ? (
                            activeLecture.transcript.map((tc, tIdx) => (
                              <div
                                key={tIdx}
                                onClick={() => {
                                  const [m, s] = tc.time.split(":").map(Number);
                                  jumpToSeconds(m * 60 + s);
                                }}
                                className="group flex items-start gap-3 p-2 hover:bg-purple-50/40 rounded-xl cursor-pointer transition-colors"
                              >
                                <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded group-hover:bg-purple-100 transition-colors">
                                  {tc.time}
                                </span>
                                <p className="text-xs text-slate-600 font-light leading-relaxed group-hover:text-slate-900 transition-colors">
                                  {tc.text}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic font-light">No transcript available for this lecture.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* LECTURE PLAYLIST SIDEBAR */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="glass-panel-darker rounded-3xl p-6 space-y-4 bg-purple-55/10">
                    <h3 className="text-xs font-bold font-mono text-purple-900 uppercase tracking-widest">
                      LECTURE PLAYLIST
                    </h3>

                    <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                      {videoLectures.map((lec, idx) => {
                        const isActive = activeLectureIdx === idx;
                        const isCompleted = lec.completed;

                        return (
                          <div
                            key={lec.id}
                            onClick={() => setActiveLectureIdx(idx)}
                            className={`group p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-3 relative overflow-hidden ${
                              isActive
                                ? "bg-gradient-to-tr from-purple-600 to-purple-800 text-white border-purple-700 shadow-md"
                                : "bg-white/75 hover:bg-white border-purple-50 text-slate-800"
                            }`}
                          >
                            {/* Play index indicator */}
                            <div className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-purple-50 text-purple-950"
                            }`}>
                              {idx + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-slate-800"}`}>
                                {lec.title}
                              </h4>
                              <span className={`text-[9px] font-mono block mt-0.5 ${isActive ? "text-purple-200" : "text-slate-400"}`}>
                                {lec.duration}
                              </span>
                            </div>

                            {/* Completed tick badge */}
                            {isCompleted && (
                              <CheckCircle2 className={`w-4 h-4 shrink-0 ${
                                isActive ? "text-white" : "text-emerald-500"
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Faculty Guidelines */}
                  <div className="glass-panel rounded-3xl p-5 bg-[#FFF2E8]/40 border border-purple-100/40 space-y-3">
                    <h4 className="text-[10px] font-bold font-mono text-purple-950 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                      ACADEMIC GUIDELINES
                    </h4>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-light">
                      "When reviewing cranial exits, always map the path of the cranial nerves alongside their respective meningeal layers. Use the study files and attachments uploaded by your instructor in Section 2 below to verify surgical board requirements."
                    </p>
                    <div className="pt-1.5 border-t border-purple-100/30 text-[9px] text-purple-900 font-medium">
                      — Dr. Krishna Garg
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: LECTURE DOCUMENTS & ATTACHMENTS */}
            <div className="space-y-4 pt-8 border-t border-purple-100">
              <div className="flex items-center gap-2 border-l-4 border-teal-600 pl-3">
                <span className="text-[10px] font-mono font-bold tracking-widest text-teal-700 bg-teal-50 px-2 py-0.5 rounded uppercase">SECTION 2</span>
                <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-800">
                  Lecture Study Documents, Blueprints & PDF Attachments
                </h3>
              </div>

              {successNotification && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm font-mono animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successNotification}</span>
                </div>
              )}

              <div className="glass-panel rounded-3xl p-6 bg-gradient-to-tr from-white to-teal-50/10 border border-teal-100/60 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-purple-50 pb-3 flex-wrap gap-2">
                  <p className="text-[11px] text-slate-500 font-light">
                    Download lecture hand-outs, study guides, syllabus chapters, and blueprints coordinated in real-time by your instructor:
                  </p>
                  <span className="text-[9px] font-mono bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {activeLecture.resources?.length || 0} FILE ATTACHMENTS
                  </span>
                </div>

                {activeLecture.resources && activeLecture.resources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeLecture.resources.map((res) => (
                      <div
                        key={res.name}
                        className="bg-white border border-teal-50 hover:border-teal-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all hover:translate-y-[-1px]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-mono text-[10px] font-black border border-teal-100/30 shrink-0">
                            {res.type}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-[11px] font-bold text-slate-800 truncate max-w-[200px]" title={res.name}>
                              {res.name}
                            </h5>
                            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{res.size}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleOpenAttachment(res.name)}
                            className="text-[9px] font-mono font-bold text-purple-800 hover:text-purple-950 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-100/50 transition-all cursor-pointer shadow-xs"
                          >
                            VIEW / OPEN
                          </button>
                          <button
                            onClick={() => handleDownload(res.name)}
                            disabled={isDownloading !== null}
                            className="text-[9px] font-mono font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-100/50 transition-all cursor-pointer shadow-xs disabled:opacity-40"
                          >
                            {isDownloading === res.name ? "PROCESSING..." : "DOWNLOAD"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <BookOpen className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-light">No study documents or PDF attachments have been uploaded for this lecture yet.</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
                      Admins can register handouts under the administrator panel to sync instantly.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: ADDITIONAL COURSE PDF HANDOUTS & DOCUMENTS (IF HYBRID) */}
            {documentLectures.length > 0 && (
              <div className="space-y-4 pt-8 border-t border-purple-100">
                <div className="flex items-center gap-2 border-l-4 border-amber-600 pl-3">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase">SECTION 3</span>
                  <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-800">
                    Additional Course PDF Handouts & Documents
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documentLectures.map((doc, docIdx) => (
                    <div key={doc.id} className="bg-white/80 border border-purple-100/40 rounded-2xl p-5 shadow-sm space-y-3">
                      <div>
                        <span className="text-[8px] font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded uppercase">
                          Document Folder {docIdx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 font-display flex items-center gap-1.5 mt-1">
                          {doc.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-light mt-0.5 line-clamp-2">{doc.description}</p>
                      </div>

                      {doc.resources && doc.resources.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-50">
                          {doc.resources.map((res) => (
                             <div key={res.name} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100/50">
                               <span className="text-[10px] text-slate-700 font-medium truncate max-w-[120px] sm:max-w-[155px]" title={res.name}>{res.name}</span>
                               <div className="flex items-center gap-1.5 shrink-0">
                                 <button
                                   onClick={() => handleOpenAttachment(res.name)}
                                   className="text-[8px] font-mono font-bold text-purple-800 hover:text-purple-950 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg border border-purple-100/50 transition-all cursor-pointer"
                                 >
                                   VIEW
                                 </button>
                                 <button
                                   onClick={() => handleDownload(res.name)}
                                   disabled={isDownloading !== null}
                                   className="text-[8px] font-mono font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-100 transition-all cursor-pointer disabled:opacity-40"
                                 >
                                   {isDownloading === res.name ? "..." : "DOWNLOAD"}
                                 </button>
                               </div>
                             </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
