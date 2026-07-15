import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2
} from "lucide-react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

interface AuthPageProps {
  onAuthSuccess: (user: { uid: string; email: string | null; name: string; role: "student" | "admin" }) => void;
  minimal?: boolean;
}

export default function AuthPage({ onAuthSuccess, minimal = false }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Feedback & Loading States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all credentials.");
      setLoading(false);
      return;
    }

    if (isSignUp && !name.trim()) {
      setError("Please enter your name.");
      setLoading(false);
      return;
    }

    try {
      const currentEmailClean = email.trim().toLowerCase();
      const isPrimaryOwner = currentEmailClean === "adityaofficial9918@gmail.com";
      let isUserAdmin = isPrimaryOwner;
      const userRole = isUserAdmin ? "admin" : "student";

      if (isSignUp) {
        // Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const firebaseUser = userCredential.user;

        // Update profile display name
        await updateProfile(firebaseUser, { displayName: name.trim() });

        // Store user profile in Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const profileData = {
          uid: firebaseUser.uid,
          name: name.trim(),
          email: firebaseUser.email,
          role: userRole,
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, profileData);

        setSuccess(`Account registered successfully as a verified ${userRole === "admin" ? "Administrator" : "Student"}!`);
        setTimeout(() => {
          onAuthSuccess({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: name.trim(),
            role: userRole
          });
        }, 1200);

      } else {
        // Log In with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const firebaseUser = userCredential.user;

        // Fetch the Firestore profile role. Rules protect role changes from self-promotion.
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);

        let userName = firebaseUser.displayName || "Student";
        if (docSnap.exists()) {
          const data = docSnap.data();
          userName = data.name || userName;

          isUserAdmin = data.role === "admin" || isPrimaryOwner;
          if (isPrimaryOwner && data.role !== "admin") {
            await setDoc(userDocRef, { ...data, role: "admin" }, { merge: true });
          }
        } else {
          // If profile document is missing, recreate it with the correct role
          await setDoc(userDocRef, {
            uid: firebaseUser.uid,
            name: userName,
            email: firebaseUser.email,
            role: isPrimaryOwner ? "admin" : "student",
            createdAt: new Date().toISOString()
          });
          isUserAdmin = isPrimaryOwner;
        }

        setSuccess(`Welcome back, ${userName}! Signing you in...`);
        setTimeout(() => {
          onAuthSuccess({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: userName,
            role: isUserAdmin ? "admin" : "student"
          });
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = "An error occurred during authentication.";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "This email is already registered. Please login or reset your password.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        errMsg = "Incorrect email or password. Please try again or click 'Forgot Password?' to reset it.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password is too weak. Must be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Please enter a valid email address.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your email address first, then click 'Forgot Password?' to receive a reset link.");
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      // Return the user to the same branded site domain after Firebase verifies the reset.
      await sendPasswordResetEmail(auth, email.trim(), {
        url: `${window.location.origin}/`,
        handleCodeInApp: false,
      });
      setSuccess("A password reset link has been dispatched to your email address. Please check your inbox!");
    } catch (err: any) {
      console.error(err);
      let errMsg = "Could not dispatch reset email.";
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-email") {
        errMsg = "Please enter a valid, registered email address.";
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const containerClass = minimal
    ? "w-full max-w-sm mx-auto px-1 py-4 relative z-20"
    : "max-w-md w-full mx-auto px-4 py-12 relative z-20";

  const cardClass = minimal
    ? "bg-transparent relative"
    : "glass-panel rounded-3xl p-8 border border-purple-100 shadow-2xl relative overflow-hidden bg-white/85 backdrop-blur-md";

  const labelClass = minimal
    ? "text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block"
    : "text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block";

  const inputClass = minimal
    ? "w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-purple-500 transition-all font-light placeholder:text-slate-500"
    : "w-full bg-white border border-purple-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:border-purple-300 transition-all font-light placeholder:text-slate-400";

  const passwordInputClass = minimal
    ? "w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white outline-none focus:border-purple-500 transition-all font-mono placeholder:text-slate-500"
    : "w-full bg-white border border-purple-100 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 outline-none focus:border-purple-300 transition-all font-mono placeholder:text-slate-400";

  const subtextClass = minimal
    ? "text-[11px] text-slate-400 font-light"
    : "text-[11px] text-slate-500 font-light";

  const borderClass = minimal
    ? "border-t border-slate-800/80"
    : "border-t border-purple-50";

  const linkClass = minimal
    ? "text-purple-400 font-bold ml-1 hover:underline cursor-pointer"
    : "text-purple-700 font-bold ml-1 hover:underline cursor-pointer";

  return (
    <div className={containerClass}>
      <div className={cardClass}>
        
        {/* Decorative ambient background glows - only on full page */}
        {!minimal && (
          <>
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          </>
        )}

        {/* Header - only on full page */}
        {!minimal && (
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mx-auto text-white shadow-md">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-purple-700 uppercase block">
              STUDENT PORTAL
            </span>
            <h2 className="text-2xl font-extrabold font-display text-slate-900 tracking-tight">
              Krishna Garg Anatomy
            </h2>
            <p className="text-xs text-slate-500 font-light leading-relaxed">
              {isSignUp 
                ? "Register your account to view lecture videos, study materials, and access resources." 
                : "Sign in to view your course library, download worksheets, and access your study portal."}
            </p>
          </div>
        )}

        {/* FEEDBACK LABELS */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`p-3.5 border text-xs rounded-2xl flex items-start gap-2.5 mb-5 font-light ${
                minimal 
                  ? "bg-rose-950/40 border-rose-900/60 text-rose-200" 
                  : "bg-rose-50 border-rose-200 text-rose-950"
              }`}
            >
              <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`p-3.5 border text-xs rounded-2xl flex items-start gap-2.5 mb-5 font-light ${
                minimal 
                  ? "bg-emerald-950/40 border-emerald-900/60 text-emerald-200" 
                  : "bg-emerald-50 border-emerald-200 text-emerald-950"
              }`}
            >
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className={labelClass}>
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className={labelClass}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="At least 6 characters..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={passwordInputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!isSignUp && (
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className={`text-[10px] font-mono cursor-pointer transition-all hover:underline ${
                    minimal ? "text-purple-400 hover:text-purple-300" : "text-purple-700 hover:text-purple-900"
                  }`}
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          {isSignUp && (
            <div className={`space-y-3 pt-3 ${borderClass}`}>
              <label className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={(e) => {
                    e.preventDefault();
                  }}
                  className="w-3.5 h-3.5 rounded border-slate-700 text-purple-700 focus:ring-purple-500"
                  disabled
                />
                <span className={minimal ? "text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide" : "text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wide"}>
                  Teacher access is assigned by an existing administrator after signup.
                </span>
              </label>

              {false && (
                <div className="space-y-1.5 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-wider block">
                      Teacher Invite Code
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-500" />
                    <input
                      type="text"
                      required={false}
                      placeholder="Enter the teacher invite key..."
                      value=""
                      onChange={() => {}}
                      className={minimal ? "w-full bg-slate-800 border border-slate-750 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-purple-500 font-mono transition-all" : "w-full bg-purple-50/30 border border-purple-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:border-purple-300 font-mono transition-all"}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 font-light italic leading-relaxed">
                    💡 Enter the invite key to automatically register with teacher capabilities.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Submission Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-medium text-xs tracking-wide uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-transform duration-150 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Processing..." : (
              <>
                {isSignUp ? "Sign Up" : "Sign In"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Informational teacher notice */}
        <div className={`mt-6 pt-4 ${borderClass} text-center`}>
          <p className="text-[10px] text-slate-400 font-light leading-relaxed">
            🛡️ <strong>Note:</strong> Approved teacher emails will automatically receive administrator options upon sign-in.
          </p>
        </div>

        {/* Auth Toggle footer */}
        <div className={`text-center mt-4 pt-4 ${borderClass}`}>
          <p className={subtextClass}>
            {isSignUp ? "Already registered?" : "Don't have an account yet?"}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className={linkClass}
            >
              {isSignUp ? "Login here" : "Sign up here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
