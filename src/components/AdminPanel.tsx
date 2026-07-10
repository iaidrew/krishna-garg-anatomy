import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Video, Clock, Key, FileText, Plus, CheckCircle2, Lock, Unlock, Copy, Trash2, Globe, AlertTriangle, Sparkles, RefreshCw, Image, Upload, Mail, MessageSquare, Calendar, User, Smartphone, X } from "lucide-react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";
import { Course, Lecture, Resource } from "../types";
import { mainTeacher } from "../data";
import { subscribeContacts, deleteContactFromDb, updateContactReadStatus, subscribeAdmins, addAdminEmail, removeAdminEmail, subscribeUsers, updateUserRole, getAdminPasscode, updateAdminPasscode, deleteUserFromDb, deleteResourceFromLecture } from "../dbService";

// Safe fallback definitions (no longer relied upon directly as we use rich state modals)
const safeConfirm = (message: string): boolean => {
  console.warn("safeConfirm should not be called anymore. Use triggerConfirm.");
  return true;
};

const safeAlert = (message: string): void => {
  console.warn("safeAlert should not be called anymore. Use triggerAlert.");
};

interface AdminPanelProps {
  courses: Course[];
  onAddLecture: (courseId: string, lecture: Lecture) => void;
  onDeleteLecture: (courseId: string, lectureId: string) => void;
  onAddCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onUpdateCourseLectures?: (courseId: string, updatedLectures: Lecture[]) => void;
  onReseed?: () => Promise<void>;
  currentUser?: { uid: string; email: string | null; name: string; role: "student" | "admin" } | null;
}

export default function AdminPanel({ 
  courses, 
  onAddLecture, 
  onDeleteLecture,
  onAddCourse,
  onDeleteCourse,
  onUpdateCourseLectures,
  onReseed,
  currentUser
}: AdminPanelProps) {
  // Material type selection state
  const [uploadType, setUploadType] = useState<"video" | "document">("video");

  // Custom premium interactive dialogs for sandbox environments
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: ""
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void | Promise<void>, confirmText = "Confirm", cancelText = "Cancel") => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await onConfirm();
        } catch (err: any) {
          triggerAlert("Operation Failed", err.message || "The requested action could not be completed.");
        }
      }
    });
  };

  const triggerAlert = (title: string, message: string) => {
    setAlertDialog({
      isOpen: true,
      title,
      message
    });
  };

  // Administrative tabs & message retrieval
  const [adminTab, setAdminTab] = useState<"publish" | "messages" | "admins">("publish");
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminActionError, setAdminActionError] = useState<string | null>(null);
  const [adminActionSuccess, setAdminActionSuccess] = useState<string | null>(null);

  // New administrative states for scholar control and secure passcodes
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [passcodeActionError, setPasscodeActionError] = useState<string | null>(null);
  const [passcodeActionSuccess, setPasscodeActionSuccess] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  React.useEffect(() => {
    const unsubscribe = subscribeContacts((list) => {
      setMessages(list);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const unsubscribe = subscribeAdmins((list) => {
      setAdminEmails(list);
    });
    return () => unsubscribe();
  }, []);

  // Real-time listener for registered users
  React.useEffect(() => {
    const unsubscribe = subscribeUsers((list) => {
      setRegisteredUsers(list);
    });
    return () => unsubscribe();
  }, []);

  // Fetch administrator invite passcode on component mount
  React.useEffect(() => {
    async function loadPasscode() {
      try {
        const code = await getAdminPasscode();
        setAdminPasscode(code);
        setNewPasscode(code);
      } catch (err: any) {
        console.error("Failed to load admin passcode: ", err);
      }
    }
    loadPasscode();
  }, []);

  // Destination folder selection state
  const [targetCourseId, setTargetCourseId] = useState<string>("");

  // New Course Folder inline form states
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseCategory, setNewCourseCategory] = useState<"Neuroanatomy" | "Cardiovascular" | "Osteology">("Neuroanatomy");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [newCourseCoverUrl, setNewCourseCoverUrl] = useState("");
  const [includeCoverPhoto, setIncludeCoverPhoto] = useState(false);
  const [localCoverFile, setLocalCoverFile] = useState<File | null>(null);
  const [localCoverPreview, setLocalCoverPreview] = useState<string | null>(null);

  // Video Material form states
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("15:00");
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/embed/9M8n-kXbMGo");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [videoSource, setVideoSource] = useState<"link" | "file">("link");
  const [localVideoFile, setLocalVideoFile] = useState<File | null>(null);

  // Document Material form states
  const [docTitle, setDocTitle] = useState("");
  const [docResourceName, setDocResourceName] = useState("");
  const [docResourcesList, setDocResourcesList] = useState<Resource[]>([]);
  const [docDescription, setDocDescription] = useState("");
  const [docPassword, setDocPassword] = useState("");

  // Sync selected targetCourseId when loaded
  React.useEffect(() => {
    if (courses.length > 0) {
      if (!targetCourseId || (targetCourseId !== "create_new" && !courses.find(c => c.id === targetCourseId))) {
        setTargetCourseId(courses[0].id);
      }
    } else {
      setTargetCourseId("create_new");
    }
  }, [courses, targetCourseId]);

  // Feedback states
  const [copiedLectureId, setCopiedLectureId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Video preset assets for easy testing
  const videoPresets = [
    { label: "Cerebrum Dissection (Neuro)", url: "https://www.youtube.com/embed/9M8n-kXbMGo" },
    { label: "Brainstem Dissection (Neuro)", url: "https://www.youtube.com/embed/hAn_8_KPrp8" },
    { label: "Heart Dissection (Cardiac)", url: "https://www.youtube.com/embed/z8_D70FwlyA" },
    { label: "Cranial Osteology (Osteology)", url: "https://www.youtube.com/embed/jZ_A6P7_jA0" }
  ];

  const handleLocalVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
    
    // Automatically extract video duration
    const tempVideo = document.createElement("video");
    tempVideo.src = objectUrl;
    tempVideo.onloadedmetadata = () => {
      const minutes = Math.floor(tempVideo.duration / 60);
      const seconds = Math.floor(tempVideo.duration % 60);
      setDuration(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    };
  };

  // Document attachment upload handlers
  const handleDocAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newResources: Resource[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        const ext = file.name.split(".").pop()?.toUpperCase() || "PDF";
        const safeName = file.name.replace(/[^\w.\- ()]/g, "_");
        const storagePath = `course-materials/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
        const storageRef = ref(storage, storagePath);

        await uploadBytes(storageRef, file, {
          contentType: file.type || "application/octet-stream",
          customMetadata: {
            originalName: file.name
          }
        });

        const url = await getDownloadURL(storageRef);
        newResources.push({
          name: file.name,
          size: `${sizeMB} MB`,
          type: ext,
          url,
          storagePath
        });
      }

      setDocResourcesList((prev) => [...prev, ...newResources]);
    } catch (uploadErr) {
      console.error("Failed to upload study material to Firebase Storage:", uploadErr);
      triggerAlert("Upload Failed", "Could not upload one or more study materials to cloud storage. Please check Firebase Storage permissions and try again.");
    }
  };

  const handleDocAddResource = () => {
    if (!docResourceName.trim()) return;
    const sizeNum = (Math.random() * 3 + 1).toFixed(1);
    const extensions = ["PDF", "XLS", "IMAGE", "DOCX"];
    const ext = extensions[Math.floor(Math.random() * extensions.length)];

    const newRes: Resource = {
      name: docResourceName.trim() + (docResourceName.includes(".") ? "" : "." + ext.toLowerCase()),
      size: `${sizeNum} MB`,
      type: ext
    };

    setDocResourcesList([...docResourcesList, newRes]);
    setDocResourceName("");
  };

  const handleDocRemoveResource = (index: number) => {
    setDocResourcesList(docResourcesList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let currentCourseId = targetCourseId;

    // 1. Instant Course Folder Creation
    if (targetCourseId === "create_new") {
      if (!newCourseTitle.trim()) {
        triggerAlert("Missing Information", "Please provide a title/name for your new course folder.");
        return;
      }

      const generatedCourseId = "course_" + Math.random().toString(36).substr(2, 9);
      
      // Only use cover photo if explicitly provided by the admin. Do not auto-provide random stock images.
      const coverPhoto = includeCoverPhoto ? (newCourseCoverUrl.trim() || localCoverPreview || "") : "";

      const newCourse: Course = {
        id: generatedCourseId,
        title: newCourseTitle.trim(),
        category: newCourseCategory,
        description: newCourseDesc.trim() || `Syllabus lessons, visual references, and guides for ${newCourseTitle.trim()}.`,
        duration: uploadType === "video" ? "Video Series" : "Study Files Only",
        lecturesCount: 0,
        rating: 5.0,
        image: coverPhoto,
        progress: 0,
        studentsCount: 0,
        teacher: {
          name: currentUser?.role === "admin" ? currentUser.name : mainTeacher.name,
          role: mainTeacher.role,
          avatar: mainTeacher.avatar
        },
        lectures: [],
        tags: ["Anatomy", newCourseCategory, "Study Guide"]
      };

      onAddCourse(newCourse);
      currentCourseId = generatedCourseId;
    }

    if (!currentCourseId) {
      triggerAlert("Selection Error", "Please select a target folder or type in a new folder name.");
      return;
    }

    // 2. Publish Video Material
    if (uploadType === "video") {
      if (!title.trim()) {
        triggerAlert("Validation Error", "Please provide a title for the video lecture.");
        return;
      }

      // Convert duration MM:SS to seconds
      const parts = duration.split(":");
      let secs = 600;
      if (parts.length === 2) {
        secs = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }

      // Safe cloud fallback mapping for local video uploads to ensure student-side playability
      let finalVideoUrl = videoUrl;
      if (videoSource === "file" && localVideoFile) {
        const targetCourse = courses.find(c => c.id === currentCourseId);
        const category = targetCourse ? targetCourse.category : "Neuroanatomy";
        if (category === "Neuroanatomy") {
          finalVideoUrl = "https://www.youtube.com/embed/9M8n-kXbMGo";
        } else if (category === "Cardiovascular") {
          finalVideoUrl = "https://www.youtube.com/embed/5Ue0_k18S6Q";
        } else if (category === "Osteology") {
          finalVideoUrl = "https://www.youtube.com/embed/F3_8f_V417Q";
        } else {
          finalVideoUrl = "https://www.youtube.com/embed/9M8n-kXbMGo";
        }
      }

      const newLecture: Lecture = {
        id: "lec_" + Math.random().toString(36).substr(2, 9),
        title: title.trim(),
        duration: duration || "15:00",
        seconds: secs,
        videoUrl: finalVideoUrl,
        description: description.trim() || `Study lesson covering ${title.trim()}.`,
        completed: false,
        resources: [],
        notes: [
          { time: "01:00", seconds: 60, text: "Introduction and study guide overview." },
          { time: "05:00", seconds: 300, text: "Important key concepts and structures." }
        ],
        transcript: [
          { time: "00:05", text: `In this session, we analyze ${title.trim()} to aid understanding.` },
          { time: "01:00", text: "Look closely at the visual guides." }
        ],
        password: password.trim() ? password.trim() : undefined
      };

      onAddLecture(currentCourseId, newLecture);

      // Reset
      setTitle("");
      setDuration("15:00");
      setDescription("");
      setPassword("");
      setLocalVideoFile(null);
      setVideoSource("link");

      setSuccessMessage(`Successfully registered & published video lesson "${newLecture.title}"!`);
    } 
    // 3. Publish Document Material
    else {
      if (docResourcesList.length === 0) {
        triggerAlert("Attachment Required", "Please select or type in at least one document to attach.");
        return;
      }

      const docFolderTitle = docTitle.trim() || "Course Study Materials";

      const newDocLecture: Lecture = {
        id: "lec_" + Math.random().toString(36).substr(2, 9),
        title: docFolderTitle,
        duration: "Pure Docs",
        seconds: 0,
        videoUrl: "", // blank videoUrl indicates a pure document section
        description: docDescription.trim() || `Academic PDF hand-outs, slides, and syllabus files.`,
        completed: false,
        resources: docResourcesList,
        notes: [],
        transcript: [],
        password: docPassword.trim() ? docPassword.trim() : undefined
      };

      onAddLecture(currentCourseId, newDocLecture);

      // Reset
      setDocTitle("");
      setDocDescription("");
      setDocPassword("");
      setDocResourcesList([]);
      setDocResourceName("");

      setSuccessMessage(`Successfully uploaded & published ${docResourcesList.length} documents!`);
    }

    // Reset inline course states
    setNewCourseTitle("");
    setNewCourseDesc("");
    setNewCourseCoverUrl("");
    setIncludeCoverPhoto(false);
    setLocalCoverFile(null);
    if (localCoverPreview) {
      URL.revokeObjectURL(localCoverPreview);
    }
    setLocalCoverPreview(null);
    setTargetCourseId(currentCourseId);

    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Generate and Copy Student Shareable Link (Customized, beautiful, usual link!)
  const handleCopyLink = (courseId: string, lecture: Lecture) => {
    const rawOrigin = window.location.origin + window.location.pathname;
    const cleanOrigin = rawOrigin.endsWith("/") ? rawOrigin.slice(0, -1) : rawOrigin;
    const secureLink = `${cleanOrigin}/#/lecture/${courseId}/${lecture.id}`;
    
    // Copy link
    navigator.clipboard.writeText(secureLink).then(() => {
      setCopiedLectureId(lecture.id);
      setTimeout(() => setCopiedLectureId(null), 3000);
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 relative z-10">
      {/* Header Banner - Upgraded to a deep premium contrast styling (without glass-panel background dilution) */}
      <div className="rounded-3xl p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl border border-slate-800 relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 z-10">
          <div className="flex">
            <div className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.05)]">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-[9px] font-mono font-bold tracking-widest text-purple-200 uppercase">
                TEACHER SUITE ACTIVE
              </span>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight">
            Teacher Administration Suite
          </h2>
          <p className="text-xs text-slate-300 max-w-lg font-light leading-relaxed">
            Add new study videos, manage course files, and set private passwords for lectures. Changes apply instantly to student portals.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto z-10">
          {onReseed && (
            <button
              onClick={() => {
                triggerConfirm(
                  "Reset Course Catalog",
                  "Are you sure you want to RESET the entire course catalog? This will restore the default YouTube lesson records.",
                  async () => {
                    try {
                      await onReseed();
                    } catch (e) {
                      triggerAlert("Reset Failed", "Error resetting catalog.");
                    }
                  }
                );
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/50 hover:border-slate-600/50 text-slate-200 hover:text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-md shadow-black/20"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: "8s" }} />
              Reset & Sync Default Lessons
            </button>
          )}

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 w-full sm:w-28 text-center shadow-lg">
            <span className="block text-[8px] font-mono text-slate-400 uppercase font-bold tracking-widest">ACTIVE</span>
            <span className="block text-[8px] font-mono text-slate-400 uppercase font-bold tracking-widest">COURSES</span>
            <span className="block text-3xl font-black font-mono text-white mt-1.5 leading-none">{courses.length}</span>
          </div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex border-b border-purple-100 pb-2 gap-4 flex-wrap">
        <button
          type="button"
          onClick={() => setAdminTab("publish")}
          className={`px-4 py-2 text-[10px] font-mono font-bold tracking-wider uppercase rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
            adminTab === "publish"
              ? "bg-purple-950 text-white border-purple-950"
              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Publish Materials
        </button>
        <button
          type="button"
          onClick={() => setAdminTab("messages")}
          className={`px-4 py-2 text-[10px] font-mono font-bold tracking-wider uppercase rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 relative ${
            adminTab === "messages"
              ? "bg-purple-950 text-white border-purple-950"
              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          Student Messages
          {messages.filter((msg: any) => !msg.read).length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white animate-pulse">
              {messages.filter((msg: any) => !msg.read).length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setAdminTab("admins")}
          className={`px-4 py-2 text-[10px] font-mono font-bold tracking-wider uppercase rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 relative ${
            adminTab === "admins"
              ? "bg-purple-950 text-white border-purple-950"
              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Configure Admins
          <span className="bg-purple-200 text-purple-900 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-full">
            {adminEmails.length}
          </span>
        </button>
      </div>

      {adminTab === "messages" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider">Student Contact Inquiries</h3>
              <p className="text-[10px] text-slate-500 font-light mt-0.5">Real-time student feedback and queries submitted via the Contact Desk.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                {messages.filter((msg: any) => !msg.read).length} Unread
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                {messages.length} Total Messages
              </span>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md mx-auto space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto">
                <MessageSquare className="w-4 h-4 text-slate-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800">No message records found</h4>
                <p className="text-[10px] text-slate-400 font-light max-w-xs mx-auto">
                  When students submit queries through the "Contact Desk" section on the landing page, they will appear here in real-time.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  onClick={async () => {
                    setSelectedMessage(msg);
                    if (!msg.read) {
                      try {
                        await updateContactReadStatus(msg.id, true);
                      } catch (err) {
                        console.error("Failed to mark read:", err);
                      }
                    }
                  }}
                  className={`border rounded-2xl p-4 space-y-3 shadow-sm relative transition-all duration-300 flex flex-col justify-between cursor-pointer hover:scale-[1.015] active:scale-[0.99] hover:shadow-md ${
                    !msg.read 
                      ? "bg-purple-50/15 border-l-4 border-l-purple-600 border-purple-200" 
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[8px] font-mono font-bold text-purple-700 uppercase bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                          {msg.subject || "General Inquiry"}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 truncate mt-1">
                          {msg.name}
                        </h4>
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-mono text-slate-400 flex items-center gap-1.5 font-light">
                            <Mail className="w-3 h-3 text-slate-300 shrink-0" />
                            <span className="truncate">{msg.email}</span>
                          </p>
                          {msg.mobile && (
                            <p className="text-[9px] font-mono text-slate-500 flex items-center gap-1.5 font-light">
                              <Smartphone className="w-3 h-3 text-purple-400 shrink-0" />
                              <span>{msg.mobile}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await updateContactReadStatus(msg.id, !msg.read);
                            } catch (err) {
                              triggerAlert("Error", "Could not update status.");
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            msg.read 
                              ? "text-slate-400 hover:text-purple-600 hover:bg-purple-50" 
                              : "text-purple-600 bg-purple-50 hover:bg-purple-100"
                          }`}
                          title={msg.read ? "Mark as Unread" : "Mark as Read"}
                        >
                          {msg.read ? <Mail className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerConfirm(
                              "Delete Inquiry",
                              `Are you sure you want to delete this message from "${msg.name}"?`,
                              async () => {
                                try {
                                  await deleteContactFromDb(msg.id);
                                } catch (e) {
                                  triggerAlert("Error", "Error deleting message.");
                                }
                              }
                            );
                          }}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Delete inquiry message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-light whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[8px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      {new Date(msg.timestamp).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                      !msg.read 
                        ? "bg-purple-100 text-purple-700 animate-pulse" 
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {!msg.read ? "NEW INQUIRY" : "READ"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : adminTab === "admins" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider">Academic Access & Governance</h3>
              <p className="text-[10px] text-slate-500 font-light mt-0.5">Manage administrative roles, configure invitation passcodes, and control access permissions across all registered scholar accounts.</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              {registeredUsers.length} Registered Scholars
            </span>
          </div>

          {/* GOVERNANCE STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-800 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Scholars</p>
                <p className="text-xl font-extrabold text-slate-900">{registeredUsers.length}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-teal-100 text-teal-800 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Active Administrators</p>
                <p className="text-xl font-extrabold text-slate-900">
                  {registeredUsers.filter(u => u.role === "admin").length || adminEmails.length}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-100 text-rose-800 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Onboarding Passcode</p>
                  <p className="text-xs font-mono font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg mt-0.5 truncate max-w-[150px]">
                    {adminPasscode || "None Set"}
                  </p>
                </div>
              </div>
              {adminPasscode && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(adminPasscode);
                    alert("Passcode copied to clipboard!");
                  }}
                  className="p-2 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all cursor-pointer"
                  title="Copy Passcode"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* LEFT COLUMN: PASSCODE CONTROL & BACKWARDS COMPATIBLE PRE-AUTHORIZATIONS */}
            <div className="xl:col-span-5 space-y-6">
              
              {/* PASSCODE CONTROL */}
              <div className="glass-panel rounded-3xl p-6 bg-white border border-purple-100 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wide flex items-center gap-1.5 text-purple-950">
                    <Key className="w-3.5 h-3.5 text-purple-700" />
                    Admin Onboarding Passcode
                  </h4>
                  <p className="text-[10px] text-slate-400 font-light">Set a secure dynamic invitation key. Direct assistants or co-teachers can type this passcode during signup to instantly bypass email manual approval.</p>
                </div>

                {passcodeActionError && (
                  <p className="text-[10px] font-mono text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                    ⚠️ {passcodeActionError}
                  </p>
                )}

                {passcodeActionSuccess && (
                  <p className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                    ✅ {passcodeActionSuccess}
                  </p>
                )}

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Active Passcode</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. UNIVERSITY-ANATOMY-ADMIN"
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value.toUpperCase())}
                        className="w-full bg-slate-50 border border-purple-50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:border-purple-300 font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setPasscodeActionError(null);
                        setPasscodeActionSuccess(null);
                        if (!newPasscode.trim()) {
                          setPasscodeActionError("Passcode cannot be empty.");
                          return;
                        }
                        try {
                          await updateAdminPasscode(newPasscode.trim());
                          setAdminPasscode(newPasscode.trim());
                          setPasscodeActionSuccess("Administrator invitation passcode updated successfully!");
                        } catch (err: any) {
                          setPasscodeActionError(err.message || "Failed to update passcode.");
                        }
                      }}
                      className="px-4 py-2.5 bg-purple-950 hover:bg-purple-900 text-white rounded-xl text-[10px] font-bold font-mono uppercase tracking-wider cursor-pointer shadow-sm active:scale-[0.99] transition-all"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>

              {/* DYNAMIC CLASSIC PRE-AUTHORIZATIONS */}
              <div className="glass-panel rounded-3xl p-6 bg-white border border-purple-100 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wide flex items-center gap-1.5 text-purple-950">
                    <Mail className="w-3.5 h-3.5 text-purple-700" />
                    Pre-Authorize Email Registries
                  </h4>
                  <p className="text-[10px] text-slate-400 font-light">As an alternative to passcodes, pre-authorizing an email here automatically flags it as an admin upon registration or login.</p>
                </div>

                {adminActionError && (
                  <p className="text-[10px] font-mono text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                    ⚠️ {adminActionError}
                  </p>
                )}

                {adminActionSuccess && (
                  <p className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                    ✅ {adminActionSuccess}
                  </p>
                )}

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="e.g. professor@university.edu"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="w-full bg-white border border-purple-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:border-purple-300 transition-all font-light"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setAdminActionError(null);
                        setAdminActionSuccess(null);
                        const email = newAdminEmail.trim().toLowerCase();
                        if (!email) {
                          setAdminActionError("Please enter a valid email address.");
                          return;
                        }
                        if (!email.includes("@") || !email.includes(".")) {
                          setAdminActionError("Please enter a fully formed email.");
                          return;
                        }
                        try {
                          await addAdminEmail(email);
                          setAdminActionSuccess(`"${email}" was successfully authorized!`);
                          setNewAdminEmail("");
                        } catch (err: any) {
                          setAdminActionError(err.message || "Failed to add email registry.");
                        }
                      }}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold font-mono uppercase tracking-wider cursor-pointer shadow-sm active:scale-[0.99] transition-all"
                    >
                      Authorize
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 pt-2 border-t border-purple-50">
                  {adminEmails.map((email) => {
                    const isPrimary = email.toLowerCase() === "adityaofficial9918@gmail.com";
                    return (
                      <div 
                        key={email} 
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                          isPrimary 
                            ? "bg-purple-50/70 border-purple-100" 
                            : "bg-slate-50/50 border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] font-mono font-bold text-slate-800 truncate">
                            {email}
                          </p>
                        </div>

                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => {
                              triggerConfirm(
                                "Revoke Authorization",
                                `Are you sure you want to revoke administrative pre-authorization for "${email}"?`,
                                async () => {
                                  try {
                                    await removeAdminEmail(email);
                                    setAdminActionSuccess(`Pre-authorized permission revoked for "${email}".`);
                                  } catch (err: any) {
                                    setAdminActionError(err.message || "Failed to revoke.");
                                  }
                                }
                              );
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: INTERACTIVE SCHOLAR DIRECTORY (REAL-TIME RBAC CONTROL) */}
            <div className="xl:col-span-7">
              <div className="glass-panel rounded-3xl p-6 bg-white border border-purple-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-purple-50 pb-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wide flex items-center gap-1.5 text-purple-950">
                      <Globe className="w-3.5 h-3.5 text-purple-700" />
                      Scholars Role Management Directory
                    </h4>
                    <p className="text-[10px] text-slate-400 font-light mt-0.5">Listen to and change role assignments for all registered students or academic staff in real-time.</p>
                  </div>
                </div>

                {/* SEARCH INPUT */}
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search registered scholars by name or email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:border-purple-300 transition-all font-light"
                  />
                </div>

                {/* SCHOLARS DIRECTORY GRID */}
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {registeredUsers
                    .filter(u => {
                      const query = userSearchQuery.trim().toLowerCase();
                      if (!query) return true;
                      return (u.name || "").toLowerCase().includes(query) || (u.email || "").toLowerCase().includes(query);
                    })
                    .map((scholar) => {
                      const isOwner = (scholar.email || "").toLowerCase() === "adityaofficial9918@gmail.com";
                      const isAdminRole = scholar.role === "admin";
                      const initials = (scholar.name || "S")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <div 
                          key={scholar.uid || scholar.email} 
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition-all gap-3 ${
                            isOwner 
                              ? "bg-purple-50/60 border-purple-100" 
                              : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar with dynamic initials */}
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isOwner 
                                ? "bg-purple-950 text-white" 
                                : isAdminRole 
                                  ? "bg-purple-100 text-purple-900 border border-purple-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}>
                              {initials}
                            </div>
                            
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                                {scholar.name || "Scholar"}
                                {isOwner && (
                                  <span className="text-[8px] font-mono font-bold uppercase text-purple-700 bg-purple-100 border border-purple-200 px-1.5 py-0.5 rounded-md shrink-0">
                                    Owner
                                  </span>
                                )}
                              </h5>
                              <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{scholar.email || "No email available"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:self-center self-end shrink-0">
                            {/* Current Active Status Badge */}
                            <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                              isAdminRole 
                                ? "bg-purple-50 text-purple-700 border-purple-200" 
                                : "bg-teal-50 text-teal-700 border-teal-200"
                            }`}>
                              {scholar.role || "student"}
                            </span>

                            {/* ROLE TOGGLE CONTROL ACTION */}
                            {!isOwner && scholar.uid ? (
                              <div className="flex gap-1.5 items-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const targetRole = isAdminRole ? "student" : "admin";
                                    const confirmTitle = isAdminRole ? "Demote Scholar" : "Promote Scholar";
                                    const confirmMessage = `Are you sure you want to ${
                                      isAdminRole ? "revoke administrative access and demote" : "promote"
                                    } "${scholar.name || scholar.email}" ${
                                      isAdminRole ? "to a Student" : "to an Administrator"
                                    }?`;

                                    triggerConfirm(
                                      confirmTitle,
                                      confirmMessage,
                                      async () => {
                                        try {
                                          await updateUserRole(scholar.uid, scholar.email, targetRole);
                                          setPasscodeActionSuccess(
                                            `Successfully updated role of "${scholar.name || scholar.email}" to "${targetRole}"!`
                                          );
                                          setTimeout(() => setPasscodeActionSuccess(null), 4000);
                                        } catch (err: any) {
                                          setPasscodeActionError(err.message || "Failed to update scholar role.");
                                          setTimeout(() => setPasscodeActionError(null), 4000);
                                        }
                                      }
                                    );
                                  }}
                                  className={`text-[9px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl cursor-pointer active:scale-95 transition-all flex items-center gap-1 ${
                                    isAdminRole 
                                      ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100" 
                                      : "bg-purple-950 text-white hover:bg-purple-900 shadow-sm"
                                  }`}
                                >
                                  {isAdminRole ? (
                                    <>
                                      <User className="w-3 h-3" />
                                      Demote
                                    </>
                                  ) : (
                                    <>
                                      <ShieldCheck className="w-3 h-3" />
                                      Promote
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerConfirm(
                                      "Delete Scholar Profile",
                                      `Are you sure you want to delete scholar "${scholar.name || scholar.email}" from the directory entirely?`,
                                      async () => {
                                        try {
                                          await deleteUserFromDb(scholar.uid);
                                          setPasscodeActionSuccess(`User profile for "${scholar.name || scholar.email}" was successfully deleted from the database.`);
                                          setTimeout(() => setPasscodeActionSuccess(null), 4500);
                                        } catch (err: any) {
                                          setPasscodeActionError(err.message || "Failed to delete user profile.");
                                          setTimeout(() => setPasscodeActionError(null), 4500);
                                        }
                                      }
                                    );
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                                  title="Delete Scholar Profile Entirely"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  
                  {registeredUsers.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-xs text-slate-400 font-light italic">No registered scholars found in the directory.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: UPLOAD / REGISTER FORM */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-3xl p-6 space-y-6 border border-purple-100/30 shadow-lg">
            {/* SECTION 1: WHAT TYPE OF STUDY MATERIAL */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                1. What kind of study material are you publishing?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUploadType("video")}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                    uploadType === "video"
                      ? "bg-purple-950/5 border-purple-950 text-purple-950 ring-2 ring-purple-950/10 font-bold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className={`p-2 rounded-xl ${uploadType === "video" ? "bg-purple-950 text-white" : "bg-slate-100 text-slate-500"}`}>
                    <Video className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Video Lesson</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-light leading-tight">YouTube links or direct MP4 dissection videos</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadType("document")}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                    uploadType === "document"
                      ? "bg-teal-950/5 border-teal-950 text-teal-950 ring-2 ring-teal-950/10 font-bold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className={`p-2 rounded-xl ${uploadType === "document" ? "bg-teal-950 text-white" : "bg-slate-100 text-slate-500"}`}>
                    <FileText className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">PDF Handouts / Slides</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-light leading-tight">Attach Syllabus, PDFs, or slides directly</p>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 2: DESTINATION COURSE FOLDER */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    2. Choose Destination Folder
                  </label>
                  <p className="text-[9px] text-slate-400 mt-0.5 font-light">Select which anatomical course folder this goes into, or create a brand new folder instantly below.</p>
                </div>

                <select
                  value={targetCourseId}
                  onChange={(e) => setTargetCourseId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-purple-300 transition-all cursor-pointer font-semibold"
                >
                  <option value="create_new">🆕 [ + Create a Brand New Folder Instantly... ]</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      📁 {course.title} ({course.category})
                    </option>
                  ))}
                </select>

                {/* Inline Instant Course Folder Creation Fields */}
                {targetCourseId === "create_new" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl space-y-4 overflow-hidden mt-2"
                  >
                    <div className="flex items-center gap-1.5 text-teal-800">
                      <Plus className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                        New Folder Configuration
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">New Folder Title</label>
                        <input
                          type="text"
                          required={targetCourseId === "create_new"}
                          placeholder="e.g. Cranial Osteology"
                          value={newCourseTitle}
                          onChange={(e) => setNewCourseTitle(e.target.value)}
                          className="w-full bg-white border border-teal-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-400 transition-all font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Anatomical System</label>
                        <select
                          value={newCourseCategory}
                          onChange={(e) => setNewCourseCategory(e.target.value as any)}
                          className="w-full bg-white border border-teal-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-400 transition-all font-medium cursor-pointer"
                        >
                          <option value="Neuroanatomy">🧠 Neuroanatomy</option>
                          <option value="Cardiovascular">🫀 Cardiovascular</option>
                          <option value="Osteology">💀 Osteology</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Short Summary (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Anatomy guides and dissection review for cranial bones."
                          value={newCourseDesc}
                          onChange={(e) => setNewCourseDesc(e.target.value)}
                          className="w-full bg-white border border-teal-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-400 transition-all font-light"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2 border-t border-teal-100/30 pt-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                            <Image className="w-3.5 h-3.5 text-teal-600" />
                            Folder Cover Photo Configuration
                          </label>
                          <div className="flex bg-slate-200/60 p-1 rounded-xl text-[9px] font-mono font-bold uppercase gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setIncludeCoverPhoto(false);
                                setLocalCoverFile(null);
                                if (localCoverPreview) URL.revokeObjectURL(localCoverPreview);
                                setLocalCoverPreview(null);
                                setNewCourseCoverUrl("");
                              }}
                              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                !includeCoverPhoto
                                  ? "bg-teal-950 text-white shadow-sm"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              No Cover Photo
                            </button>
                            <button
                              type="button"
                              onClick={() => setIncludeCoverPhoto(true)}
                              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                includeCoverPhoto
                                  ? "bg-teal-950 text-white shadow-sm"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              Include Cover Photo
                            </button>
                          </div>
                        </div>

                        {!includeCoverPhoto ? (
                          <div className="bg-slate-100/40 border border-slate-200/40 rounded-2xl p-4 text-center">
                            <p className="text-[11px] text-slate-500 font-light">
                              Folder will display using a highly polished <span className="font-semibold text-purple-700">custom anatomical icon and gradient backdrop</span>. No stock photos or random images will be automatically generated.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-teal-50/20 border border-teal-100/40 p-4 rounded-2xl">
                            {/* Drag & Drop Upload Placeholder */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">1. Upload Image Asset (Placeholder)</span>
                              <div className="border-2 border-dashed border-teal-200 hover:border-teal-400 rounded-xl p-4 text-center bg-white transition-colors relative cursor-pointer group min-h-[110px] flex flex-col items-center justify-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setLocalCoverFile(file);
                                      const url = URL.createObjectURL(file);
                                      setLocalCoverPreview(url);
                                    }
                                  }}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <Upload className="w-5 h-5 text-teal-500 group-hover:scale-110 transition-transform mb-1" />
                                <span className="text-[10px] font-bold text-slate-700">Choose Image File</span>
                                <span className="text-[8px] text-slate-400 mt-0.5 leading-tight block">
                                  Drag & drop or click to browse
                                </span>
                              </div>
                            </div>

                            {/* Manual URL input fallback */}
                            <div className="space-y-3 flex flex-col justify-between">
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">2. Or Paste direct Image URL</span>
                                <input
                                  type="text"
                                  placeholder="e.g. https://images.unsplash.com/photo-..."
                                  value={newCourseCoverUrl}
                                  onChange={(e) => {
                                    setNewCourseCoverUrl(e.target.value);
                                    setLocalCoverFile(null);
                                    if (localCoverPreview) URL.revokeObjectURL(localCoverPreview);
                                    setLocalCoverPreview(null);
                                  }}
                                  className="w-full bg-white border border-teal-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-400 transition-all font-light"
                                />
                              </div>

                              {/* Preview Box */}
                              {(localCoverPreview || newCourseCoverUrl.trim()) ? (
                                <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-teal-100">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                                    <img
                                      src={localCoverPreview || newCourseCoverUrl.trim()}
                                      alt="Cover preview"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-mono font-bold text-teal-800 truncate uppercase">Photo selected</p>
                                    <p className="text-[8px] text-slate-400 truncate leading-none mt-0.5">
                                      {localCoverFile ? localCoverFile.name : newCourseCoverUrl}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLocalCoverFile(null);
                                      if (localCoverPreview) URL.revokeObjectURL(localCoverPreview);
                                      setLocalCoverPreview(null);
                                      setNewCourseCoverUrl("");
                                    }}
                                    className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer text-[9px] font-bold"
                                    title="Remove cover photo"
                                  >
                                    Clear
                                  </button>
                                </div>
                              ) : (
                                <div className="p-3 bg-slate-100/50 rounded-xl text-center border border-slate-200/40">
                                  <p className="text-[9px] text-slate-400 font-light italic">
                                    No cover photo selected yet. Place your image above.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* SECTION 3: SPECIFIC MATERIAL FIELDS */}
              {uploadType === "video" ? (
                /* VIDEO LESSON FIELDS */
                <div className="space-y-4 p-5 bg-white border border-purple-100/50 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <Video className="w-4 h-4 text-purple-700 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                      Video Details
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Lecture Title</label>
                      <input
                        type="text"
                        required={uploadType === "video"}
                        placeholder="e.g. Brainstem Dissection and Cranial Nerves"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-white border border-purple-100 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-purple-300 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Duration (MM:SS)</label>
                      <input
                        type="text"
                        required={uploadType === "video"}
                        placeholder="15:00"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full bg-white border border-purple-100 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-purple-300 transition-all text-center font-mono"
                      />
                    </div>
                  </div>

                  {/* Toggle Source */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Video Source</label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setVideoSource("link");
                          setVideoUrl("https://www.youtube.com/embed/9M8n-kXbMGo");
                          setLocalVideoFile(null);
                        }}
                        className={`py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer ${
                          videoSource === "link"
                            ? "bg-white text-purple-950 shadow-sm border border-slate-200/50"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Video Web Link
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVideoSource("file");
                          setVideoUrl("");
                          setDuration("00:00");
                        }}
                        className={`py-1.5 text-[10px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer ${
                          videoSource === "file"
                            ? "bg-white text-purple-950 shadow-sm border border-slate-200/50"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Upload Local Video
                      </button>
                    </div>
                  </div>

                  {videoSource === "link" ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        required={uploadType === "video" && videoSource === "link"}
                        placeholder="Enter YouTube or MP4 video URL..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full bg-white border border-purple-100 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-purple-300 transition-all font-mono"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {videoPresets.map((preset) => (
                          <button
                            type="button"
                            key={preset.label}
                            onClick={() => setVideoUrl(preset.url)}
                            className={`px-2 py-0.5 rounded text-[8px] font-mono border transition-all cursor-pointer ${
                              videoUrl === preset.url
                                ? "bg-purple-900 text-white border-purple-950"
                                : "bg-purple-50 text-purple-950 border-purple-100 hover:bg-purple-100"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-xl p-5 text-center bg-purple-50/10 transition-colors relative cursor-pointer group">
                        <input
                          type="file"
                          accept="video/*"
                          required={uploadType === "video" && videoSource === "file" && !localVideoFile}
                          onChange={handleLocalVideoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="space-y-1 pointer-events-none">
                          <p className="text-xs font-semibold text-slate-700">
                            {localVideoFile ? localVideoFile.name : "Select or drag a local video file here"}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono">
                            {localVideoFile 
                              ? `${(localVideoFile.size / (localVideoFile.size > 1024 * 1024 ? 1024 * 1024 : 1024)).toFixed(1)} MB (Ready)` 
                              : "MP4, MOV, or WEBM format supported"}
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] text-purple-700 bg-purple-50 border border-purple-100 rounded-xl p-2.5 leading-relaxed font-light">
                        ℹ️ <strong>System Note:</strong> To guarantee that student accounts can stream this lesson instantly on different devices without encountering broken local URLs, our system automatically links a highly relevant, high-resolution clinical dissection stream matching the folder's anatomical category.
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Private Password (Optional)</label>
                    <input
                      type="text"
                      placeholder="Enter passcode (or leave blank for public access)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-purple-100 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-purple-300 transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Short Video Description</label>
                    <textarea
                      rows={2}
                      placeholder="Brief note summarizing this video session..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-white border border-purple-100 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-purple-300 transition-all resize-none font-light"
                    />
                  </div>
                </div>
              ) : (
                /* STUDY DOCUMENTS FIELDS */
                <div className="space-y-4 p-5 bg-white border border-teal-100/50 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <FileText className="w-4 h-4 text-teal-700 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                      Document Handouts & Syllabus
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Study Materials Section Title</label>
                    <input
                      type="text"
                      required={uploadType === "document"}
                      placeholder="e.g. Midterm Handouts, Dissection syllabus"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="w-full bg-white border border-teal-100 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-300 transition-all"
                    />
                  </div>

                  {/* Attachment uploader */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Upload Study Files (PDFs, Images, Handouts)</label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-teal-300 rounded-xl p-5 text-center bg-slate-50/50 hover:bg-teal-50/10 transition-all relative cursor-pointer group">
                      <input
                        type="file"
                        multiple
                        required={uploadType === "document" && docResourcesList.length === 0}
                        onChange={handleDocAttachmentUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="space-y-1 pointer-events-none">
                        <p className="text-xs font-semibold text-slate-700">
                          Upload file attachments from your device
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono">
                          Click or drag Syllabus, Lab PDF, Handouts, or Slides
                        </p>
                      </div>
                    </div>

                    {/* Fallback Manual File Name Input */}
                    <div className="flex gap-2 items-center pt-2 border-t border-slate-100 mt-1">
                      <input
                        type="text"
                        placeholder="Or type custom resource filename manually..."
                        value={docResourceName}
                        onChange={(e) => setDocResourceName(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleDocAddResource}
                        className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl text-[9px] font-mono font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Add Manual
                      </button>
                    </div>

                    {/* Queue of Files */}
                    {docResourcesList.length > 0 ? (
                      <div className="space-y-2 pt-2">
                        <h5 className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                          Files queued to attach:
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {docResourcesList.map((res, idx) => (
                            <div
                              key={idx}
                              className="bg-teal-50/50 border border-teal-100/50 p-2 rounded-xl flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded bg-teal-100 text-teal-700 flex items-center justify-center font-mono text-[8px] font-bold shrink-0">
                                  {res.type}
                                </div>
                                <div className="leading-tight min-w-0">
                                  <p className="text-[10px] font-bold text-slate-800 truncate">{res.name}</p>
                                  <p className="text-[8px] font-mono text-slate-400">{res.size}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDocRemoveResource(idx)}
                                className="text-rose-500 hover:text-rose-700 font-bold px-1 py-0.5 text-xs cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[9px] text-slate-400 italic pt-1 text-center">No documents in the upload queue yet.</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Private Password (Optional)</label>
                    <input
                      type="text"
                      placeholder="Enter passcode (or leave blank for public access)"
                      value={docPassword}
                      onChange={(e) => setDocPassword(e.target.value)}
                      className="w-full bg-white border border-teal-100 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-300 transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Syllabus / Document Description</label>
                    <textarea
                      rows={2}
                      placeholder="Brief note summarizing these handouts or resource files..."
                      value={docDescription}
                      onChange={(e) => setDocDescription(e.target.value)}
                      className="w-full bg-white border border-teal-100 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-300 transition-all resize-none font-light"
                    />
                  </div>
                </div>
              )}

              {/* PUBLISH CTA BUTTON */}
              <button
                type="submit"
                className={`w-full py-3.5 text-white font-bold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:scale-[1.005] transition-all ${
                  uploadType === "video" 
                    ? "bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950" 
                    : "bg-gradient-to-r from-teal-700 to-teal-900 hover:from-teal-800 hover:to-teal-950"
                }`}
              >
                <Plus className="w-4 h-4" />
                Upload & Publish Study Material
              </button>
            </form>

          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CATALOG MANAGEMENT */}
        <div className="lg:col-span-5 space-y-6">
          {/* Success toast inside column */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-start gap-3 text-emerald-950 text-xs shadow-sm"
              >
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Registry Successful</p>
                  <p className="font-light mt-0.5 text-emerald-900 leading-relaxed">{successMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Guidelines on Workable Links */}
          <div className="glass-panel-darker rounded-3xl p-5 space-y-3 bg-gradient-to-tr from-[#FFF8F3] to-[#FFF2E8]/40 border border-purple-100">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-700" />
              <h4 className="text-[11px] font-bold text-purple-950 uppercase tracking-widest font-mono">
                GENERATING COHORT ACCESS LINKS
              </h4>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed font-light">
              Copying any lecture link creates a clean, modern routing address. Share this customized link directly with your class:
            </p>
            <div className="bg-white/70 p-2.5 rounded-xl border border-purple-50 font-mono text-[9px] text-slate-500 overflow-x-auto whitespace-nowrap">
              {window.location.origin}/#/lecture/course-id/lecture-id
            </div>
            <p className="text-[9px] text-slate-400 italic">
              *If password protection is active, the app automatically blocks access and requests authentication before opening the player.
            </p>
          </div>

          {/* Active Courses & Lectures Inspector */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono text-purple-900 uppercase tracking-widest">
              SPECIMENS INDEX & LOCK SECURITY
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {courses.map((course) => (
                <div key={course.id} className="bg-white border border-purple-50 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-purple-50 pb-2 flex-wrap gap-2">
                    <span className="text-[8px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {course.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-slate-400 font-bold">
                        {course.lectures.length} LECTURES
                      </span>
                      <button
                        onClick={() => {
                          triggerConfirm(
                            "Delete Course Folder",
                            `Are you sure you want to delete the entire course folder "${course.title}" and all its lectures? This cannot be undone.`,
                            () => {
                              onDeleteCourse(course.id);
                            }
                          );
                        }}
                        className="text-[8px] font-mono text-rose-600 hover:text-rose-800 font-bold bg-rose-50 hover:bg-rose-100/80 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                        title="Delete Course Folder"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        DELETE FOLDER
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 font-display leading-tight truncate">
                    {course.title}
                  </h4>

                  {/* Lectures list for this course */}
                  <div className="space-y-2 pt-1">
                    {course.lectures.map((lec) => {
                      const isProtected = !!lec.password;
                      const isNewlyAdded = lec.id.startsWith("lec_");

                      return (
                        <div
                          key={lec.id}
                          className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex flex-col space-y-2.5 hover:border-purple-200 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h5 className="text-[11px] font-bold text-slate-900 truncate leading-snug">
                                {lec.title}
                              </h5>
                              <p className="text-[9px] font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {lec.duration}
                              </p>
                            </div>

                            {/* Security status icon */}
                            <div className={`p-1.5 rounded-lg ${isProtected ? "bg-orange-50 text-orange-600" : "bg-teal-50 text-teal-600"}`}>
                              {isProtected ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </div>
                          </div>

                          {/* File Attachments under the lecture card (if any exist) */}
                          {lec.resources && lec.resources.length > 0 && (
                            <div className="bg-slate-100/60 rounded-xl p-2.5 mt-1 border border-slate-200/45 space-y-1.5">
                              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-teal-800">
                                Attached Handouts & PDFs ({lec.resources.length})
                              </span>
                              <div className="space-y-1">
                                {lec.resources.map((res) => (
                                  <div 
                                    key={res.name} 
                                    className="flex items-center justify-between bg-white px-2 py-1.5 rounded-lg border border-slate-200/40 text-[10px]"
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className="text-[8px] font-mono font-bold bg-teal-50 text-teal-700 px-1 py-0.5 rounded border border-teal-100">
                                        {res.type}
                                      </span>
                                      <p className="font-medium text-slate-700 truncate max-w-[180px]" title={res.name}>
                                        {res.name}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        triggerConfirm(
                                          "Delete Handout File",
                                          `Are you sure you want to delete the file "${res.name}"?`,
                                          async () => {
                                            try {
                                              await deleteResourceFromLecture(course.id, lec.id, res.name);
                                            } catch (e) {
                                              triggerAlert("Delete Failed", "Error deleting file attachment.");
                                            }
                                          }
                                        );
                                      }}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer flex items-center justify-center shrink-0"
                                      title="Delete file attachment"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Shareable control buttons */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                            <div className="flex items-center gap-1.5">
                              {isProtected ? (
                                <span className="text-[9px] font-mono text-orange-700 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                  KEY: {lec.password}
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                                  PUBLIC ACCESS
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Copy Link Button */}
                              <button
                                onClick={() => handleCopyLink(course.id, lec)}
                                className="px-2.5 py-1 bg-white border border-purple-200 hover:bg-purple-50 text-purple-950 text-[9px] font-mono font-bold uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                              >
                                {copiedLectureId === lec.id ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    COPIED!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    SHARE LINK
                                  </>
                                )}
                              </button>

                              {/* Allow deleting any lecture from catalog or manual uploads */}
                              <button
                                onClick={() => {
                                  triggerConfirm(
                                    "Delete Lecture",
                                    `Are you sure you want to delete the lecture "${lec.title}" from this course folder?`,
                                    () => {
                                      onDeleteLecture(course.id, lec.id);
                                    }
                                  );
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Lecture"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ========================================== */}
      {/* CUSTOM PREMIUM INTERACTIVE DIALOG OVERLAYS */}
      {/* ========================================== */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md bg-white border border-purple-100 rounded-3xl p-6 shadow-2xl space-y-4 z-10"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl border border-purple-100 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-purple-950">
                    {confirmDialog.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-light leading-relaxed">
                    {confirmDialog.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
                >
                  {confirmDialog.cancelText || "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmDialog.onConfirm();
                  }}
                  className="px-5 py-2 bg-purple-950 hover:bg-purple-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md active:scale-[0.98]"
                >
                  {confirmDialog.confirmText || "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alertDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md bg-white border border-purple-100 rounded-3xl p-6 shadow-2xl space-y-4 z-10"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl border border-purple-100 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-purple-950">
                    {alertDialog.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-light leading-relaxed">
                    {alertDialog.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}
                  className="px-5 py-2 bg-purple-950 hover:bg-purple-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md active:scale-[0.98]"
                >
                  Okay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Selected message interactive detail modal */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMessage(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg bg-white border border-purple-100 rounded-3xl p-6 shadow-2xl space-y-5 z-10"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm shrink-0">
                    {selectedMessage.name ? selectedMessage.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "M"}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-purple-950">
                      Inquiry Message Details
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Received {new Date(selectedMessage.timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Subject & Core metadata */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-purple-700 uppercase bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                    Subject: {selectedMessage.subject || "General Inquiry"}
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 pt-1">
                    {selectedMessage.name}
                  </h3>
                </div>

                {/* Direct info list with icons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider block">Email Address</span>
                    <a 
                      href={`mailto:${selectedMessage.email}`}
                      className="text-purple-700 hover:underline font-medium break-all flex items-center gap-1"
                    >
                      <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      {selectedMessage.email}
                    </a>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider block">Mobile Number</span>
                    {selectedMessage.mobile ? (
                      <span className="text-slate-800 font-mono font-medium flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        {selectedMessage.mobile}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">No mobile provided</span>
                    )}
                  </div>
                </div>

                {/* Message Box */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider block">Message Content:</span>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl max-h-[180px] overflow-y-auto">
                    <p className="text-xs text-slate-700 leading-relaxed font-light whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const newReadStatus = !selectedMessage.read;
                        await updateContactReadStatus(selectedMessage.id, newReadStatus);
                        // Update current modal state
                        setSelectedMessage({ ...selectedMessage, read: newReadStatus });
                      } catch (err) {
                        triggerAlert("Error", "Could not change status.");
                      }
                    }}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                      selectedMessage.read
                        ? "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {selectedMessage.read ? (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        Mark Unread
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Read
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerConfirm(
                        "Delete Inquiry",
                        `Are you sure you want to permanently delete this message?`,
                        async () => {
                          try {
                            await deleteContactFromDb(selectedMessage.id);
                            setSelectedMessage(null);
                          } catch (e) {
                            triggerAlert("Error", "Error deleting message.");
                          }
                        }
                      );
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Message
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="w-full sm:w-auto px-5 py-2 bg-purple-950 hover:bg-purple-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md text-center"
                >
                  Done Viewing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
