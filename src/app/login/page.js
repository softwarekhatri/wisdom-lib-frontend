"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Eye, EyeOff, LogIn, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(
        user.role === "STUDENT" ? "/student/dashboard" : "/admin/dashboard",
      );
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const loggedUser = await login(form.username.trim(), form.password);
      toast.success(`Welcome back, ${loggedUser.fullName}!`);
      router.push(
        loggedUser.role === "STUDENT"
          ? "/student/dashboard"
          : "/admin/dashboard",
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(201,161,94,0.1),transparent_60%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_left,rgba(67,51,44,0.4),transparent_50%)]" />

      {/* Floating books */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl opacity-10 pointer-events-none"
          style={{ left: `${10 + i * 16}%`, top: `${20 + (i % 3) * 20}%` }}
          animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut",
          }}
        >
          📚
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back link */}
        <Link
          href="/"
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary to-primary-dark p-8 text-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,161,94,0.15),transparent)]" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              className="w-16 h-16 rounded-2xl bg-gold mx-auto flex items-center justify-center mb-4 shadow-lg"
            >
              <BookOpen className="w-8 h-8 text-primary-dark" />
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-white mb-1">
              Welcome Back
            </h1>
            <p className="text-white/60 text-sm">
              Sign in to your Wisdom Library account
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-primary mb-2 uppercase tracking-wide">
                  Mobile Number / Email
                </label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, username: e.target.value }))
                  }
                  placeholder="Enter your mobile or email"
                  className="input-field"
                />
                <p className="text-primary-lighter text-xs mt-1">
                  Students use mobile number
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-2 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    placeholder="Enter your password"
                    className="input-field pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-lighter hover:text-primary transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2 text-base"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-primary-50 rounded-xl">
              <p className="text-primary-lighter text-xs text-center">
                Forgot your password? Please contact the library admin to reset
                it.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} Wisdom Library — All rights reserved
        </p>
      </motion.div>
    </div>
  );
}
