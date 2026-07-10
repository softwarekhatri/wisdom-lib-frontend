"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import {
  formatDate,
  formatCurrency,
  getPaymentStatus,
  getMembershipDuration,
  isAnniversaryWindow,
  MONTH_NAMES,
  photoUrl,
} from "@/lib/utils";
import {
  Calendar,
  CreditCard,
  User,
  BookOpen,
  Trophy,
  Star,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  AlertCircle,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Armchair,
} from "lucide-react";
import toast from "react-hot-toast";
import CopyButton from "@/components/CopyButton";

/* ─── Confetti ──────────────────────────────────────────────────── */
const CONFETTI_COLORS = [
  "#c9a15e",
  "#43332c",
  "#e8c98a",
  "#6b5548",
  "#fff",
  "#f59e0b",
];
function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-sm"
          style={{
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            left: `${Math.random() * 100}%`,
            top: "-12px",
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 120],
            rotate: [0, Math.random() * 720],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 3,
            ease: "linear",
            repeat: Infinity,
            repeatDelay: Math.random() * 4,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Anniversary Banner ────────────────────────────────────────── */
function AnniversaryBanner({ yearsCompleted }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1a0f0a] via-primary to-gold-dark p-7 text-white mb-6 shadow-2xl"
    >
      <Confetti />
      <div className="relative z-10 text-center">
        <motion.div
          animate={{ scale: [1, 1.25, 1], rotate: [0, 15, -15, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
          className="text-6xl mb-3 inline-block"
        >
          🎉
        </motion.div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2 drop-shadow">
          Happy {yearsCompleted} Year{yearsCompleted > 1 ? "s" : ""}{" "}
          Anniversary!
        </h2>
        <p className="text-white/75 text-sm max-w-md mx-auto">
          Congratulations on completing {yearsCompleted} wonderful year
          {yearsCompleted > 1 ? "s" : ""} as a proud member of the Wisdom
          Library family!
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {Array.from({ length: Math.min(yearsCompleted, 5) }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{
                delay: i * 0.15,
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <Star className="w-5 h-5 text-gold fill-gold" />
            </motion.div>
          ))}
        </div>
        <p className="text-gold/70 text-xs mt-3 font-medium tracking-wide italic">
          &ldquo;Knowledge is the greatest wealth — keep reading!&rdquo;
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Premium Membership Card ──────────────────────────────────── */
function MembershipCard({ student, membershipDuration }) {
  const username = student?.mobile || student?.username || "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-3xl overflow-hidden shadow-2xl mb-6"
      style={{
        background:
          "linear-gradient(135deg, #1a0f0a 0%, #2d2219 40%, #43332c 70%, #5a4038 100%)",
      }}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(201,161,94,0.4) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 3s linear infinite",
        }}
      />

      {/* Decorative circles */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gold/5" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/3" />
      <div className="absolute top-6 right-6 w-24 h-24 rounded-full border border-gold/10" />

      {/* Horizontal gold line (card chip style) */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="relative z-10 p-6 sm:p-8">
        {/* Top row */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center">
              <BookOpen
                className="w-4.5 h-4.5 text-gold"
                style={{ width: 18, height: 18 }}
              />
            </div>
            <div>
              <div className="text-gold font-display font-bold text-sm tracking-wide">
                WISDOM LIBRARY
              </div>
              <div className="text-white/40 text-xs tracking-widest uppercase">
                Membership Card
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-gold/60 text-xs tracking-widest uppercase mb-0.5">
              Username
            </div>
            <div className="flex items-center gap-1.5 text-white/80 font-mono text-sm font-semibold">
              {username}
              <CopyButton value={username} className="text-gold/60 hover:text-gold" />
            </div>
          </div>
        </div>

        {/* Student info */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative flex-shrink-0">
            <div
              className="w-18 h-18 rounded-2xl overflow-hidden border-2 border-gold/30 flex items-center justify-center bg-white/10 shadow-lg"
              style={{ width: 72, height: 72 }}
            >
              {student?.photo ? (
                <img
                  src={photoUrl(student.photo)}
                  alt={student?.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-white/40" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-primary-dark" />
          </div>
          <div>
            <div className="text-white/60 text-xs uppercase tracking-widest mb-0.5">
              Card Holder
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight">
              {student?.fullName}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-gold/80 text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Since {formatDate(student?.admissionDate, "MMM yyyy")}
              </span>
              {membershipDuration?.years >= 1 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs font-semibold">
                  <Trophy className="w-3 h-3" />
                  {membershipDuration.years}yr Member
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-xs">
                <Armchair className="w-3 h-3" />
                Seat {student?.seatNumber || "—"}
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-xs">
                <Clock className="w-3 h-3" />
                {student?.batch || "Not decided"}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom stats strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Membership",
              value:
                membershipDuration?.years > 0
                  ? `${membershipDuration.years}y ${membershipDuration.months}m`
                  : `${membershipDuration?.totalMonths || 0} months`,
            },
            {
              label: "Monthly Fee",
              value: formatCurrency(student?.libraryFees),
            },
            {
              label: "Member Since",
              value: formatDate(student?.admissionDate, "MMM dd, yyyy"),
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/8"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="text-gold/60 text-xs uppercase tracking-wide mb-0.5">
                {label}
              </div>
              <div className="text-white font-semibold text-sm">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Payment Status Card ───────────────────────────────────────── */
function PaymentStatusCard({ payStatus, libraryFees }) {
  const isOverdue = payStatus.status === "due";
  const isDueSoon = payStatus.status === "due-soon";
  const isPaid = payStatus.status === "paid";

  const outstandingMonths = isOverdue
    ? Math.max(1, Math.ceil(-payStatus.daysUntilDue / 30))
    : 0;
  const outstandingBalance = outstandingMonths * (libraryFees || 0);

  const bgClass = isOverdue
    ? "bg-gradient-to-r from-red-900/90 to-red-800/90 border-red-700/50"
    : isDueSoon
      ? "bg-gradient-to-r from-orange-900/80 to-orange-800/80 border-orange-600/50"
      : "bg-gradient-to-r from-emerald-900/80 to-green-800/80 border-emerald-600/50";

  const icon = isOverdue ? (
    <AlertCircle className="w-8 h-8 text-red-300" />
  ) : isDueSoon ? (
    <Clock className="w-8 h-8 text-orange-300" />
  ) : (
    <CheckCircle className="w-8 h-8 text-emerald-300" />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className={`rounded-2xl border p-5 mb-5 ${bgClass}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 className="text-white font-display font-bold text-lg leading-tight">
              {isOverdue
                ? "Payment Overdue!"
                : isDueSoon
                  ? "Payment Due Soon"
                  : "Payment Up to Date"}
            </h3>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${isOverdue ? "bg-red-500/40 text-red-200" : isDueSoon ? "bg-orange-500/40 text-orange-200" : "bg-emerald-500/40 text-emerald-200"}`}
            >
              {isOverdue
                ? "ACTION NEEDED"
                : isDueSoon
                  ? `${payStatus.daysUntilDue} DAYS LEFT`
                  : "ALL CLEAR"}
            </span>
          </div>

          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <span className="text-white/50 w-28 flex-shrink-0">Status:</span>
              <span className="font-medium">{payStatus.label}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <span className="text-white/50 w-28 flex-shrink-0">
                Next Due Date:
              </span>
              <span
                className={`font-bold ${isOverdue ? "text-red-300" : isDueSoon ? "text-orange-300" : "text-white"}`}
              >
                {payStatus.dueDateLabel}
              </span>
            </div>
            {libraryFees > 0 && (
              <div className="flex items-center gap-2 text-white/80">
                <span className="text-white/50 w-28 flex-shrink-0">
                  Amount Due:
                </span>
                <span className="font-bold text-gold">
                  {formatCurrency(libraryFees)}
                </span>
              </div>
            )}
          </div>

          {isOverdue && outstandingBalance > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-red-950/50 border border-red-500/30">
              <p className="text-red-200 font-bold text-sm">
                Outstanding Balance: {formatCurrency(outstandingBalance)}
              </p>
              <p className="text-red-300/70 text-xs mt-0.5">
                Please contact the library admin to clear your dues.
              </p>
            </div>
          )}

          {(isOverdue || isDueSoon) && (
            <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/60 flex items-center gap-1.5">
              <span>📍</span>
              <span>
                Payments accepted at the library office only &nbsp;·&nbsp; +91
                98765 43210
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Quick Stats ───────────────────────────────────────────────── */
function QuickStats({ membershipDuration, totalPaid, payStatus, libraryFees }) {
  const stats = [
    {
      icon: "📅",
      label: "Membership",
      value:
        membershipDuration?.years > 0
          ? `${membershipDuration.years}y ${membershipDuration.months}m`
          : `${membershipDuration?.totalMonths || 0} mo`,
      sub: "Active duration",
      color: "from-primary to-primary-light",
    },
    {
      icon: "💰",
      label: "Total Paid",
      value: formatCurrency(totalPaid),
      sub: "Lifetime payments",
      color: "from-gold-dark to-gold",
    },
    {
      icon: "📆",
      label: "Next Due",
      value: payStatus.dueDateLabel,
      sub:
        payStatus.daysUntilDue >= 0
          ? `in ${payStatus.daysUntilDue} days`
          : `${Math.abs(payStatus.daysUntilDue)} days overdue`,
      color:
        payStatus.status === "paid"
          ? "from-emerald-600 to-green-500"
          : payStatus.status === "due-soon"
            ? "from-orange-600 to-orange-400"
            : "from-red-700 to-red-500",
    },
    {
      icon: "🏷️",
      label: "Monthly Fee",
      value: formatCurrency(libraryFees),
      sub: "Per month",
      color: "from-primary-light to-primary-lighter",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.07 }}
          className="bg-white rounded-2xl border border-primary-100 p-4 hover:shadow-md transition-shadow group"
        >
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform`}
          >
            {s.icon}
          </div>
          <div className="text-xs text-primary-lighter font-medium uppercase tracking-wide mb-0.5">
            {s.label}
          </div>
          <div className="text-primary font-display font-bold text-base leading-tight">
            {s.value}
          </div>
          <div className="text-primary-lighter text-xs mt-0.5">{s.sub}</div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Change Password Modal ─────────────────────────────────────── */
function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (form.newPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }
    setLoading(true);
    try {
      await api.patch("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully!");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ id, label, value, showKey }) => (
    <div>
      <label className="block text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          type={show[showKey] ? "text" : "password"}
          required
          value={value}
          onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
          className="input-field pr-11 text-sm"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShow((s) => ({ ...s, [showKey]: !s[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-lighter hover:text-primary"
        >
          {show[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary to-primary-light p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-display font-bold text-lg">
                Change Password
              </h2>
              <p className="text-white/60 text-xs">Keep your account secure</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field
            id="currentPassword"
            label="Current Password"
            value={form.currentPassword}
            showKey="current"
          />
          <Field
            id="newPassword"
            label="New Password"
            value={form.newPassword}
            showKey="new"
          />
          <Field
            id="confirmPassword"
            label="Confirm New Password"
            value={form.confirmPassword}
            showKey="confirm"
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-primary-200 text-primary text-sm font-medium hover:bg-primary-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Tagline section ────────────────────────────────────────────── */
function TaglineSection({ membershipDuration, admissionDate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary-dark p-6 text-white mb-5"
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(rgba(201,161,94,0.6) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="w-14 h-14 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-7 h-7 text-gold" />
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-gold leading-tight mb-1">
            You are a proud member of the Wisdom Library family!
          </p>
          <p className="text-white/60 text-sm">
            Continuously growing since{" "}
            {formatDate(admissionDate, "MMMM d, yyyy")}
            {membershipDuration?.years >= 1 && (
              <span className="text-gold ml-1 font-semibold">
                — {membershipDuration.years} year
                {membershipDuration.years > 1 ? "s" : ""} of excellence!
              </span>
            )}
          </p>
          {membershipDuration?.years >= 1 && (
            <div className="flex items-center gap-1 mt-2 justify-center sm:justify-start">
              {Array.from({
                length: Math.min(membershipDuration.years, 5),
              }).map((_, i) => (
                <Trophy key={i} className="w-4 h-4 text-gold fill-gold/30" />
              ))}
              <span className="text-gold text-xs font-bold ml-1">
                {membershipDuration.years}x Year Achiever
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Payment History ───────────────────────────────────────────── */
function PaymentHistory({ payments, page, setPage, pagination }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl border border-primary-100 overflow-hidden mb-5"
    >
      <div className="px-5 py-4 border-b border-primary-50 flex items-center justify-between bg-primary-50/50">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary-lighter" />
          <h2 className="font-semibold text-primary">Payment History</h2>
        </div>
        <span className="text-xs text-primary-lighter bg-white px-3 py-1 rounded-full border border-primary-100 font-medium">
          {pagination?.total || 0} Records
        </span>
      </div>

      {payments.length === 0 ? (
        <div className="py-14 text-center">
          <CreditCard className="w-10 h-10 text-primary-200 mx-auto mb-3" />
          <p className="text-primary-lighter text-sm">No payment records yet</p>
        </div>
      ) : (
        <div className="divide-y divide-primary-50">
          {payments.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="px-5 py-4 flex items-center gap-4 hover:bg-primary-50/50 transition-colors group"
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${p.mode === "cash" ? "bg-green-100" : "bg-blue-100"}`}
                >
                  {p.mode === "cash" ? (
                    <IndianRupee
                      className="w-4.5 h-4.5 text-green-600"
                      style={{ width: 18, height: 18 }}
                    />
                  ) : (
                    <CreditCard
                      className="w-4.5 h-4.5 text-blue-600"
                      style={{ width: 18, height: 18 }}
                    />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {formatDate(p.receivedDate)}
                    </p>
                    <p className="text-xs text-primary-lighter mt-0.5">
                      {p.monthsCovered?.length > 0
                        ? `Covers: ${p.monthsCovered.map((mc) => `${MONTH_NAMES[mc.month - 1].slice(0, 3)} ${mc.year}`).join(", ")}`
                        : "Month not specified"}
                    </p>
                    {p.referenceNo && (
                      <p className="text-xs text-primary-lighter/70 mt-0.5 font-mono">
                        Ref: {p.referenceNo}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-display font-bold text-primary">
                      {formatCurrency(p.amount)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.mode === "cash" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                    >
                      {p.mode === "cash" ? "💵 Cash" : "💳 Online"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 p-4 border-t border-primary-50 bg-primary-50/30">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-lg border border-primary-200 flex items-center justify-center disabled:opacity-30 hover:bg-white transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-primary-lighter font-medium">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="w-8 h-8 rounded-lg border border-primary-200 flex items-center justify-center disabled:opacity-30 hover:bg-white transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    const uid = user.id || user._id;
    if (!uid) return;
    const load = async () => {
      setLoading(true);
      try {
        const [studentRes, paymentsRes] = await Promise.all([
          api.get(`/students/${uid}`),
          api.get(`/payments/student/${uid}`, { params: { page } }),
        ]);
        setData(studentRes.data);
        setPayments(paymentsRes.data.payments);
        setPagination(paymentsRes.data.pagination);
      } catch {}
      setLoading(false);
    };
    load();
  }, [user, page]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-52 bg-primary-200/50 rounded-3xl" />
        <div className="h-28 bg-white rounded-2xl border border-primary-100" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-white rounded-2xl border border-primary-100"
            />
          ))}
        </div>
        <div className="h-64 bg-white rounded-2xl border border-primary-100" />
      </div>
    );
  }

  const student = data?.student || user;
  const allPayments = data?.payments || [];
  const membershipDuration = getMembershipDuration(student?.admissionDate);
  const { isAnniversary, yearsCompleted } = isAnniversaryWindow(
    student?.admissionDate,
  );

  const totalMonthsPaid = allPayments.reduce(
    (sum, p) => sum + (p.monthsCovered?.length || 0),
    0,
  );
  const payStatus = getPaymentStatus(student?.admissionDate, totalMonthsPaid);
  const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      {/* Anniversary */}
      <AnimatePresence>
        {isAnniversary && <AnniversaryBanner yearsCompleted={yearsCompleted} />}
      </AnimatePresence>

      {/* Membership card */}
      <MembershipCard
        student={student}
        membershipDuration={membershipDuration}
      />

      {/* Payment status */}
      <PaymentStatusCard
        payStatus={payStatus}
        libraryFees={student?.libraryFees}
      />

      {/* Quick stats */}
      <QuickStats
        membershipDuration={membershipDuration}
        totalPaid={totalPaid}
        payStatus={payStatus}
        libraryFees={student?.libraryFees || 0}
      />

      {/* Tagline */}
      <TaglineSection
        membershipDuration={membershipDuration}
        admissionDate={student?.admissionDate}
      />

      {/* Payment history */}
      <PaymentHistory
        payments={payments}
        page={page}
        setPage={setPage}
        pagination={pagination}
      />

      {/* Security section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl border border-primary-100 p-5 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary-lighter" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">
              Account Security
            </p>
            <p className="text-xs text-primary-lighter">
              Update your login password
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Change Password
        </button>
      </motion.div>

      {/* Password modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
