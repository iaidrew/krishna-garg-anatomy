import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Terminal, Cpu, X, Activity, Lock, ShieldAlert, Key, HelpCircle, LogOut } from "lucide-react";
import Navigation from "./components/Navigation";
import LandingPage from "./components/LandingPage";
import LecturePlayer from "./components/LecturePlayer";
import UploadExperience from "./components/UploadExperience";
import AIAssistant from "./components/AIAssistant";
import AdminPanel from "./components/AdminPanel";
import AuthPage from "./components/AuthPage";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import { coursesData } from "./data";
import { Course, Lecture } from "./types";
import { subscribeCourses, addLectureToCourse, deleteLectureFromCourse, addCourseToDb, deleteCourseFromDb, seedInitialCourses, updateCourseLectures } from "./dbService";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "about" | "contact" | "courses" | "upload" | "admin" | "auth">("home");
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeLectureIdx, setActiveLectureIdx] = useState<number>(0);

  // Micro-interaction: Active highlighted medical term
  const [highlightedTerm, setHighlightedTerm] = useState<string | null>(null);

  // User Profile State
  const [user, setUser] = useState<{ uid: string; email: string | null; name: string; role: "student" | "admin" } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Dynamic courses database with Firestore real-time sync
  const [courses, setCourses] = useState<Course[]>([]);

  // Subscribe to real-time courses only after authentication state is known.
  useEffect(() => {
    if (authLoading || !user) {
      setCourses([]);
      return;
    }

    const unsubscribe = subscribeCourses((updatedCourses) => {
      setCourses(updatedCourses);
    });
    return () => unsubscribe();
  }, [authLoading, user]);

  // Listen to Firebase Auth changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: data.name || firebaseUser.displayName || "Scholar",
              role: data.role === "admin" ? "admin" : "student"
            });
          } else {
            // Default student fallback
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || "Scholar",
              role: "student"
            });
          }
        } catch (e) {
          console.error("Error fetching user document from Firestore:", e);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || "Scholar",
            role: "student"
          });
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Secure Shared Link detection & Verification
  const [sharedCourseId, setSharedCourseId] = useState<string | null>(null);
  const [sharedLectureId, setSharedLectureId] = useState<string | null>(null);
  const [sharedLecture, setSharedLecture] = useState<Lecture | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [unlockedLectures, setUnlockedLectures] = useState<Record<string, boolean>>({});
  const [pendingPasscode, setPendingPasscode] = useState<string | null>(null);

  // Premium promo authentication popup
  const [showPromoAuthPopup, setShowPromoAuthPopup] = useState<boolean>(false);

  // Premium trigger: Prompt login for anonymous readers shortly after load
  useEffect(() => {
    if (!authLoading && !user) {
      const dismissed = sessionStorage.getItem("dismissedPromoAuthPopup");
      if (!dismissed) {
        const timer = setTimeout(() => {
          setShowPromoAuthPopup(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else if (user) {
      setShowPromoAuthPopup(false);
    }
  }, [authLoading, user]);

  // 1. Process initial shared link query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let cId = params.get("courseId");
    let lId = params.get("lectureId");

    // FALLBACK: Parse beautiful clean hash-routing (e.g. #/lecture/course_id/lecture_id)
    if (!cId || !lId) {
      const hash = window.location.hash;
      if (hash && hash.includes("/lecture/")) {
        const parts = hash.split("/lecture/");
        if (parts.length === 2) {
          const subParts = parts[1].split("/");
          if (subParts.length === 2) {
            cId = subParts[0];
            lId = subParts[1];
          }
        }
      }
    }

    if (cId && lId && courses.length > 0) {
      const course = courses.find((c) => c.id === cId);
      const lecture = course?.lectures.find((l) => l.id === lId);

      if (lecture) {
        setSharedCourseId(cId);
        setSharedLectureId(lId);
        setSharedLecture(lecture);

        // If the lecture is public or already unlocked, bypass verification
        if (!lecture.password || unlockedLectures[lecture.id]) {
          setSelectedCourseId(cId);
          const index = course?.lectures.findIndex((l) => l.id === lId) ?? -1;
          if (index !== -1) {
            setActiveLectureIdx(index);
          }
          setActiveTab("courses");
          // Clear query params for polished look without full page reload
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [courses, unlockedLectures]);

  // 2. Intercept selection inside LecturePlayer if a password-protected lecture is chosen
  useEffect(() => {
    if (selectedCourseId && courses.length > 0) {
      const course = courses.find((c) => c.id === selectedCourseId);
      const lecture = course?.lectures[activeLectureIdx];

      if (lecture && lecture.password && !unlockedLectures[lecture.id]) {
        // Enforce the secure overlay trigger!
        setSharedCourseId(selectedCourseId);
        setSharedLectureId(lecture.id);
        setSharedLecture(lecture);
      }
    }
  }, [selectedCourseId, activeLectureIdx, courses, unlockedLectures]);

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedLecture || !sharedCourseId || !sharedLectureId) return;

    if (passwordInput.trim() === sharedLecture.password) {
      // Correct password! Register unlock status
      setUnlockedLectures((prev) => ({ ...prev, [sharedLecture.id]: true }));
      setSelectedCourseId(sharedCourseId);
      
      const course = courses.find((c) => c.id === sharedCourseId);
      if (course) {
        const index = course.lectures.findIndex((l) => l.id === sharedLectureId);
        if (index !== -1) {
          setActiveLectureIdx(index);
        }
      }

      setActiveTab("courses");
      
      // Clear temporary states
      setSharedCourseId(null);
      setSharedLectureId(null);
      setSharedLecture(null);
      setPasswordInput("");
      setPasswordError("");

      // Clear search query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setPasswordError("Neural Access Code Denied. Please verify the administrator credential.");
    }
  };

  const handleCancelSharedAccess = () => {
    setSharedCourseId(null);
    setSharedLectureId(null);
    setSharedLecture(null);
    setPasswordInput("");
    setPasswordError("");
    setActiveTab("home");
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleHighlightTerm = (term: string) => {
    setHighlightedTerm(term);
    setTimeout(() => {
      setHighlightedTerm((curr) => (curr === term ? null : curr));
    }, 4500);
  };

  // Safe handler to select course, select specific lecture if given, and jump tab
  const handleSelectCourse = (courseId: string, lectureId?: string) => {
    let targetCourseId = courseId;
    
    // Smart fallback for hardcoded footer course IDs to dynamic ones by category
    const courseExists = courses.some(c => c.id === courseId);
    if (!courseExists) {
      if (courseId === "course-1") {
        const found = courses.find(c => c.category === "Neuroanatomy");
        if (found) targetCourseId = found.id;
      } else if (courseId === "course-2") {
        const found = courses.find(c => c.category === "Cardiovascular");
        if (found) targetCourseId = found.id;
      } else if (courseId === "course-3") {
        const found = courses.find(c => c.category === "Osteology");
        if (found) targetCourseId = found.id;
      }
    }

    setSelectedCourseId(targetCourseId);
    if (lectureId) {
      const course = courses.find(c => c.id === targetCourseId);
      if (course) {
        const index = course.lectures.findIndex(l => l.id === lectureId);
        if (index !== -1) {
          setActiveLectureIdx(index);
        }
      }
    } else {
      setActiveLectureIdx(0);
    }
    setActiveTab("courses");
  };

  // Safe navigation director from footer click links or hero actions
  const handleNavigate = (tab: "home" | "about" | "contact" | "courses" | "upload" | "admin" | "auth", extraId?: string) => {
    if (tab === "courses" && !user) {
      setActiveTab("auth");
      return;
    }
    if (tab === "courses" && extraId) {
      handleSelectCourse(extraId);
    } else {
      if (tab === "upload" && !user) {
        setActiveTab("auth");
        return;
      }
      if (tab === "admin" && (!user || user.role !== "admin")) {
        setActiveTab("auth");
        return;
      }
      setActiveTab(tab);
      if (tab === "courses") {
        setSelectedCourseId(null);
      }
    }
  };

  const handleUnlockWithPasscode = (passcode: string, overrideUser?: any): { success: boolean; message: string; title?: string } => {
    const activeUser = overrideUser || user;
    if (!activeUser) {
      setPendingPasscode(passcode);
      setActiveTab("auth");
      return {
        success: true,
        message: "Academic authentication is required. Redirecting to login/signup. Your clinical lecture will be instantly unlocked after you log in."
      };
    }

    for (const course of courses) {
      for (const lecture of course.lectures) {
        if (lecture.password && lecture.password.trim().toLowerCase() === passcode.trim().toLowerCase()) {
          setUnlockedLectures(prev => ({ ...prev, [lecture.id]: true }));
          setSelectedCourseId(course.id);
          const index = course.lectures.findIndex(l => l.id === lecture.id);
          if (index !== -1) {
            setActiveLectureIdx(index);
          }
          setActiveTab("courses");
          return {
            success: true,
            message: `Passcode verified! Redirecting to lecture: ${lecture.title}`,
            title: lecture.title
          };
        }
      }
    }

    return {
      success: false,
      message: "No matching clinical lecture was found with this access passcode. Please verify the password."
    };
  };

  // Logout trigger
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setActiveTab("home");
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  // Admin database editors (delegated to Firebase)
  const handleAddLecture = async (courseId: string, newLecture: Lecture) => {
    try {
      await addLectureToCourse(courseId, newLecture);
    } catch (e) {
      console.error("Error adding lecture to Firestore:", e);
    }
  };

  const handleDeleteLecture = async (courseId: string, lectureId: string) => {
    try {
      await deleteLectureFromCourse(courseId, lectureId);
    } catch (e) {
      console.error("Error deleting lecture from Firestore:", e);
    }
  };

  const handleAddCourse = async (newCourse: Course) => {
    try {
      await addCourseToDb(newCourse);
    } catch (e) {
      console.error("Error adding course to Firestore:", e);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourseFromDb(courseId);
    } catch (e) {
      console.error("Error deleting course from Firestore:", e);
    }
  };

  const handleUpdateCourseLectures = async (courseId: string, updatedLectures: Lecture[]) => {
    try {
      await updateCourseLectures(courseId, updatedLectures);
    } catch (e) {
      console.error("Error updating course lectures in Firestore:", e);
    }
  };

  const handleReseed = async () => {
    try {
      // First, clear existing courses from Firestore to avoid duplicate records
      for (const course of courses) {
        await deleteCourseFromDb(course.id);
      }
      // Re-seed with the brand new real clinical dissection YouTube dataset
      await seedInitialCourses();
    } catch (e) {
      console.error("Error resetting and seeding catalog:", e);
      throw e;
    }
  };

  const handleDismissPromo = () => {
    sessionStorage.setItem("dismissedPromoAuthPopup", "true");
    setShowPromoAuthPopup(false);
  };

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip bg-[#FFF8F3] text-slate-900 flex flex-col justify-between selection:bg-purple-100 selection:text-purple-900 pb-14 sm:pb-20">
      {/* BACKGROUND NOISE OVERLAY */}
      <div className="noise-overlay" />

      {/* AMBIENT BACKGROUND GLOW BLOBS */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] aurora-blur-1 opacity-65 pointer-events-none z-0" />
      <div className="absolute top-[600px] left-10 w-[500px] h-[500px] aurora-blur-2 opacity-50 pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] aurora-blur-3 opacity-60 pointer-events-none z-0" />

      {/* FLOATING GLASS NAVIGATION */}
      <div className="pt-6 relative z-30">
        <Navigation
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === "courses" && !user) {
              setActiveTab("auth");
              return;
            }
            if (tab === "upload" && !user) {
              setActiveTab("auth");
              return;
            }
            if (tab === "admin" && (!user || user.role !== "admin")) {
              setActiveTab("auth");
              return;
            }
            setActiveTab(tab);
            if (tab === "courses") {
              setSelectedCourseId(null);
            }
          }}
          onOpenAI={() => setIsAIOpen(true)}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* MASTER ACTIVE PAGE STAGE */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-4 relative z-10 py-2 sm:py-4 overflow-x-clip">
        {authLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-10 h-10 rounded-full border-2 border-purple-200 border-t-purple-700 animate-spin" />
            <p className="text-xs font-mono tracking-widest text-slate-400 font-bold uppercase">
              LOADING ANATOMY PORTAL...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              {activeTab === "home" && (
                <LandingPage
                  onNavigate={handleNavigate}
                  onOpenAI={() => setIsAIOpen(true)}
                  onUnlockWithPasscode={handleUnlockWithPasscode}
                />
              )}

              {activeTab === "about" && (
                <AboutPage />
              )}

              {activeTab === "contact" && (
                <ContactPage />
              )}

              {activeTab === "courses" && (
                <LecturePlayer
                  courses={courses}
                  onOpenAI={() => setIsAIOpen(true)}
                  selectedCourseId={selectedCourseId}
                  setSelectedCourseId={setSelectedCourseId}
                  activeLectureIdx={activeLectureIdx}
                  setActiveLectureIdx={setActiveLectureIdx}
                />
              )}

              {activeTab === "upload" && <UploadExperience />}

              {activeTab === "admin" && user && user.role === "admin" && (
                <AdminPanel
                  courses={courses}
                  onAddLecture={handleAddLecture}
                  onDeleteLecture={handleDeleteLecture}
                  onAddCourse={handleAddCourse}
                  onDeleteCourse={handleDeleteCourse}
                  onUpdateCourseLectures={handleUpdateCourseLectures}
                  onReseed={handleReseed}
                  currentUser={user}
                />
              )}

              {activeTab === "auth" && (
                <AuthPage
                  onAuthSuccess={(userData) => {
                    setUser(userData);
                    if (pendingPasscode) {
                      const result = handleUnlockWithPasscode(pendingPasscode, userData);
                      setPendingPasscode(null);
                      if (!result.success) {
                        if (userData.role === "admin") {
                          setActiveTab("admin");
                        } else {
                          setActiveTab("courses");
                        }
                      }
                    } else {
                      if (userData.role === "admin") {
                        setActiveTab("admin");
                      } else {
                        setActiveTab("courses");
                      }
                    }
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* IMMERSIVE PASSWORD ACCESS LOCK OVERLAY */}
      <AnimatePresence>
        {sharedLecture && sharedLecture.password && !unlockedLectures[sharedLecture.id] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="max-w-md w-full bg-slate-900 border border-purple-900/30 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden"
            >
              {/* Background gradient lines */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-orange-950/50 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto text-orange-400 shadow-lg">
                  <Lock className="w-5 h-5 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold tracking-widest text-orange-400 uppercase">
                    PROTECTED LESSON
                  </span>
                  <h3 className="text-lg font-bold font-display text-white tracking-tight">
                    Enter Lesson Password
                  </h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed max-w-sm mx-auto">
                    The lecture video <strong>"{sharedLecture.title}"</strong> is password-protected. Enter the password assigned by your teacher.
                  </p>
                </div>
              </div>

              {/* Password submission form */}
              <form onSubmit={handleVerifyPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      autoFocus
                      required
                      placeholder="Type the password..."
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setPasswordError("");
                      }}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none font-mono"
                    />
                  </div>
                  {passwordError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] text-rose-400 font-mono"
                    >
                      {passwordError}
                    </motion.p>
                  )}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelSharedAccess}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 hover:opacity-90 text-white font-medium text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-purple-500/10"
                  >
                    Unlock Lesson
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLY FUNCTIONAL SIDEBAR AI ASSISTANT */}
      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onHighlightTerm={handleHighlightTerm}
      />

      {/* IMMERSIVE TERM HIGHLIGHT HUD ALERT (MICRO-INTERACTIONS) */}
      <AnimatePresence>
        {highlightedTerm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="fixed bottom-6 left-6 z-50 max-w-sm glass-panel p-4 rounded-2xl border border-teal-200 shadow-xl bg-teal-50/90 flex items-start gap-3.5 backdrop-blur-md"
          >
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-teal-700 tracking-wider uppercase">
                  ANATOMICAL TERM FOUND
                </span>
                <button
                  onClick={() => setHighlightedTerm(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-tight">
                HIGHLIGHT: {highlightedTerm}
              </h4>
              <p className="text-[10px] text-teal-900 font-light leading-relaxed">
                We found the term <strong>{highlightedTerm}</strong>! Use the AI chat assistant or view the lecture list to explore related diagrams and explanations.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PREMIUM PROMO LOGIN POPUP */}
      <AnimatePresence>
        {showPromoAuthPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="max-w-2xl w-full bg-slate-900 border border-purple-900/40 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row my-8"
            >
              {/* Close Button */}
              <button
                onClick={handleDismissPromo}
                className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 p-1.5 rounded-full transition-colors cursor-pointer"
                title="Dismiss and Continue as Guest"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Column: Visual Promo Panel */}
              <div className="md:w-5/12 bg-gradient-to-br from-purple-900 via-slate-950 to-slate-950 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-purple-900/20">
                {/* Background decorative lines */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    KG
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-purple-400 uppercase">
                      WELCOME STUDENTS
                    </span>
                    <h3 className="text-xl font-extrabold font-display text-white tracking-tight leading-tight">
                      Unlock Full Course Access
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-300 font-light leading-relaxed">
                    Sign up or log in to watch lesson videos, ask questions to our AI tutor, and download study guides.
                  </p>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-800/60 relative z-10">
                  <div className="flex gap-2.5 items-center">
                    <div className="w-5 h-5 rounded-full bg-purple-950/80 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] text-slate-200 font-medium">AI Study Helper</span>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <div className="w-5 h-5 rounded-full bg-purple-950/80 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                      <Activity className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] text-slate-200 font-medium">Video Lectures</span>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <div className="w-5 h-5 rounded-full bg-purple-950/80 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                      <Lock className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] text-slate-200 font-medium">Ask Teachers Directly</span>
                  </div>
                </div>

                <div className="pt-6 relative z-10 hidden md:block">
                  <p className="text-[9px] font-mono text-slate-500">
                    Krishna Garg Anatomy Portal © 2026
                  </p>
                </div>
              </div>

              {/* Right Column: Embedded Auth Form */}
              <div className="md:w-7/12 bg-slate-900 p-6 md:p-8 flex flex-col justify-center">
                <div className="mb-2">
                  <span className="text-[8px] font-mono font-bold tracking-widest text-slate-400 uppercase bg-slate-800 px-2 py-0.5 rounded-full">
                    STUDENT SIGN IN
                  </span>
                </div>
                <AuthPage
                  minimal={true}
                  onAuthSuccess={(userData) => {
                    setUser(userData);
                    setShowPromoAuthPopup(false);
                  }}
                />
                
                <div className="mt-2 text-center">
                  <button
                    onClick={handleDismissPromo}
                    className="text-[10px] font-mono font-bold text-slate-400 hover:text-white transition-colors cursor-pointer underline underline-offset-4"
                  >
                    Continue as Guest Student
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
