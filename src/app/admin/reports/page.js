"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Users,
  IndianRupee,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Trash2,
  X,
  Banknote,
  CreditCard,
  ExternalLink,
  Armchair,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  MONTH_NAMES,
  photoUrl,
  toLocalDateStr,
} from "@/lib/utils";
import StudentAvatar from "@/components/StudentAvatar";
import { useAuth } from "@/contexts/AuthContext";

const CHART_COLORS = {
  primary: "#43332c",
  gold: "#c9a15e",
  light: "#9a7b6e",
  green: "#16a34a",
  red: "#dc2626",
};

const TABS = [
  { id: "payment", label: "💰 Payment Report" },
  { id: "dues", label: "⚠️ Dues Report" },
  { id: "comparison", label: "📊 Comparison" },
  { id: "financials", label: "💹 Financials" },
  { id: "shifts", label: "🪑 Shift Distribution" },
];

const FIN_PRESETS = [
  { label: "Last 1 Week", value: "thisweek" },
  { label: "This Month", value: "thismonth" },
  { label: "1 Month", value: "1month" },
  { label: "3 Months", value: "3months" },
  { label: "6 Months", value: "6months" },
  { label: "Custom", value: "custom" },
];

function getFinDateRange(preset) {
  const now = new Date();
  const end = toLocalDateStr(now);
  let start;
  if (preset === "thisweek") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    start = toLocalDateStr(d);
  } else if (preset === "thismonth") {
    start = toLocalDateStr(new Date(now.getFullYear(), now.getMonth(), 1));
  } else if (preset === "1month") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    start = toLocalDateStr(d);
  } else if (preset === "3months") {
    const d = new Date(now);
    d.setDate(d.getDate() - 90);
    start = toLocalDateStr(d);
  } else if (preset === "6months") {
    const d = new Date(now);
    d.setDate(d.getDate() - 180);
    start = toLocalDateStr(d);
  } else {
    start = toLocalDateStr(new Date(now.getFullYear(), now.getMonth(), 1));
  }
  return { startDate: start, endDate: end };
}

const PRESETS = [
  { label: "Today", value: "today" },
  { label: "1 Week", value: "week" },
  { label: "1 Month", value: "month" },
  { label: "3 Months", value: "3months" },
  { label: "Custom", value: "custom" },
];

function getDateRange(preset) {
  const now = new Date();
  const end = toLocalDateStr(now);
  let start;
  if (preset === "today") start = end;
  else if (preset === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    start = toLocalDateStr(d);
  } else if (preset === "month") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    start = toLocalDateStr(d);
  } else if (preset === "3months") {
    const d = new Date(now);
    d.setDate(d.getDate() - 90);
    start = toLocalDateStr(d);
  } else start = end;
  return { startDate: start, endDate: end };
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-primary text-white px-3 py-2 rounded-xl shadow-lg text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name}>
          {p.name}:{" "}
          {typeof p.value === "number" ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

const WaIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

function buildWaReminderUrl(student) {
  const number =
    "91" + (student.whatsappNumber || student.mobile || "").replace(/\D/g, "");
  const dueText = student.hasDues
    ? "Your library fee is overdue. Please pay at the earliest to keep your seat active."
    : `Your library fee is due in ${student.daysUntilDue} day${student.daysUntilDue !== 1 ? "s" : ""}. Please pay on time to avoid interruption.`;
  const msg = encodeURIComponent(
    `Hi ${student.fullName},\n\n${dueText}\n\nThank you,\n*Wisdom Library*`,
  );
  return `https://wa.me/${number}?text=${msg}`;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const canManageExpenses =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const canSendReminders = user?.role !== "VIEWER";
  const [activeTab, setActiveTab] = useState("payment");
  const [chartType, setChartType] = useState("area");
  const [preset, setPreset] = useState("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [paymentData, setPaymentData] = useState(null);
  const [duesData, setDuesData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [duesPage, setDuesPage] = useState(1);
  const [duesPagination, setDuesPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  // Comparison state
  const [compMode, setCompMode] = useState("auto"); // 'auto' | 'custom'
  const [compP1Start, setCompP1Start] = useState("");
  const [compP1End, setCompP1End] = useState("");
  const [compP2Start, setCompP2Start] = useState("");
  const [compP2End, setCompP2End] = useState("");

  // Financials state
  const [finPreset, setFinPreset] = useState("thismonth");
  const [finCustomStart, setFinCustomStart] = useState("");
  const [finCustomEnd, setFinCustomEnd] = useState("");
  const [financialsData, setFinancialsData] = useState(null);
  const [finLoading, setFinLoading] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expForm, setExpForm] = useState({
    amount: "",
    date: toLocalDateStr(new Date()),
    mode: "cash",
    remarks: "",
  });
  const [expSubmitting, setExpSubmitting] = useState(false);
  const [deletingExpId, setDeletingExpId] = useState(null);

  // Shift distribution state
  const [shiftData, setShiftData] = useState(null);
  const [shiftActiveOnly, setShiftActiveOnly] = useState(true);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [shiftDrilldown, setShiftDrilldown] = useState(null); // { shiftCount, batch, label } | null

  const fetchPaymentReport = async () => {
    setLoading(true);
    try {
      const dates =
        preset === "custom"
          ? { startDate: customStart, endDate: customEnd }
          : getDateRange(preset);
      const { data } = await api.get("/reports/payments", { params: dates });
      setPaymentData(data);
    } catch {
      toast.error("Failed to load payment report");
    }
    setLoading(false);
  };

  const fetchDues = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/reports/dues", {
        params: { page: duesPage },
      });
      setDuesData(data.students);
      setDuesPagination(data.pagination);
    } catch {
      toast.error("Failed to load dues");
    }
    setLoading(false);
  };

  // Fires in the background when "Remind" is clicked — doesn't block or
  // interfere with the WhatsApp link opening in its own tab.
  const handleRemind = (studentId) => {
    const now = new Date().toISOString();
    setDuesData((prev) =>
      prev?.map((s) => (s._id === studentId ? { ...s, lastReminderSentAt: now } : s)) ?? prev,
    );
    api.patch(`/students/${studentId}/remind`).catch(() => {});
  };

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const params =
        compMode === "custom" &&
        compP1Start &&
        compP1End &&
        compP2Start &&
        compP2End
          ? {
              p1Start: compP1Start,
              p1End: compP1End,
              p2Start: compP2Start,
              p2End: compP2End,
            }
          : {};
      const { data } = await api.get("/reports/comparison", { params });
      setComparisonData(data);
    } catch {
      toast.error("Failed to load comparison");
    }
    setLoading(false);
  };

  const fetchFinancials = async () => {
    setFinLoading(true);
    try {
      const dates =
        finPreset === "custom"
          ? { startDate: finCustomStart, endDate: finCustomEnd }
          : getFinDateRange(finPreset);
      const { data } = await api.get("/reports/financials", { params: dates });
      setFinancialsData(data);
    } catch {
      toast.error("Failed to load financials");
    }
    setFinLoading(false);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expForm.amount || parseFloat(expForm.amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!expForm.date) {
      toast.error("Select a date");
      return;
    }
    setExpSubmitting(true);
    try {
      await api.post("/expenses", {
        amount: parseFloat(expForm.amount),
        date: expForm.date,
        mode: expForm.mode,
        remarks: expForm.remarks,
      });
      toast.success("Expense added");
      setExpForm({
        amount: "",
        date: toLocalDateStr(new Date()),
        mode: "cash",
        remarks: "",
      });
      setShowAddExpense(false);
      fetchFinancials();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add expense");
    }
    setExpSubmitting(false);
  };

  const fetchShiftDistribution = async () => {
    setShiftLoading(true);
    try {
      const { data } = await api.get("/reports/shifts", {
        params: { active: shiftActiveOnly },
      });
      setShiftData(data);
      setShiftDrilldown(null);
    } catch {
      toast.error("Failed to load shift distribution");
    }
    setShiftLoading(false);
  };

  const handleDeleteExpense = async (id) => {
    setDeletingExpId(id);
    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Expense deleted");
      fetchFinancials();
    } catch {
      toast.error("Failed to delete expense");
    }
    setDeletingExpId(null);
  };

  useEffect(() => {
    if (activeTab === "payment") fetchPaymentReport();
    else if (activeTab === "dues") fetchDues();
    else if (activeTab === "comparison") fetchComparison();
    else if (activeTab === "financials") fetchFinancials();
    else if (activeTab === "shifts") fetchShiftDistribution();
  }, [activeTab, preset, customStart, customEnd, duesPage]);

  useEffect(() => {
    if (activeTab === "shifts") fetchShiftDistribution();
  }, [shiftActiveOnly]);

  useEffect(() => {
    if (activeTab === "comparison") fetchComparison();
  }, [compMode, compP1Start, compP1End, compP2Start, compP2End]);

  useEffect(() => {
    if (activeTab === "financials") fetchFinancials();
  }, [finPreset, finCustomStart, finCustomEnd]);

  const renderPaymentChart = () => {
    if (!paymentData?.chartData?.length)
      return (
        <div className="py-12 text-center text-primary-lighter text-sm">
          No data for this period
        </div>
      );
    const data = paymentData.chartData;

    const commonProps = {
      data,
      margin: { top: 10, right: 20, left: 10, bottom: 5 },
    };

    return (
      <ResponsiveContainer width="100%" height={320}>
        {chartType === "area" ? (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={CHART_COLORS.primary}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={CHART_COLORS.primary}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5e8e0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: CHART_COLORS.light }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: CHART_COLORS.light }}
              tickFormatter={(v) =>
                `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              name="Total"
              stroke={CHART_COLORS.primary}
              fill="url(#colorTotal)"
              strokeWidth={2}
            />
          </AreaChart>
        ) : chartType === "bar" ? (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5e8e0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: CHART_COLORS.light }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: CHART_COLORS.light }}
              tickFormatter={(v) =>
                `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="cash"
              name="Cash"
              fill={CHART_COLORS.primary}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="online"
              name="Online"
              fill={CHART_COLORS.gold}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        ) : (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5e8e0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: CHART_COLORS.light }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: CHART_COLORS.light }}
              tickFormatter={(v) =>
                `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke={CHART_COLORS.primary}
              strokeWidth={2.5}
              dot={{ fill: CHART_COLORS.primary, r: 4 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    );
  };

  const shiftCounts = shiftData
    ? Object.keys(shiftData.shiftCountTotals).map(Number).sort((a, b) => a - b)
    : [];

  const drilldownStudents =
    shiftDrilldown && shiftData
      ? shiftData.students.filter(
          (s) =>
            (shiftDrilldown.shiftCount == null || s.shiftCount === shiftDrilldown.shiftCount) &&
            (shiftDrilldown.batch == null || s.batches.includes(shiftDrilldown.batch)),
        )
      : [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">
          Reports
        </h1>
        <p className="text-primary-lighter mt-1">Analytics and insights</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === t.id
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-primary border border-primary-100 hover:bg-primary-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Payment Report */}
      {activeTab === "payment" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-primary-100 p-4 flex flex-wrap gap-3 items-center">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPreset(p.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${preset === p.value ? "bg-primary text-white" : "bg-primary-50 text-primary hover:bg-primary-100"}`}
              >
                {p.label}
              </button>
            ))}
            {preset === "custom" && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="input-field w-full sm:w-auto text-sm py-2"
                />
                <span className="text-primary-lighter text-sm hidden sm:block">
                  to
                </span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="input-field w-full sm:w-auto text-sm py-2"
                />
              </div>
            )}
          </div>

          {/* Summary cards */}
          {paymentData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Collected",
                  value: formatCurrency(paymentData.summary.totalAmount),
                  color: "bg-primary",
                },
                {
                  label: "Cash",
                  value: formatCurrency(paymentData.summary.cashTotal),
                  color: "bg-green-600",
                },
                {
                  label: "Online",
                  value: formatCurrency(paymentData.summary.onlineTotal),
                  color: "bg-blue-600",
                },
                {
                  label: "Transactions",
                  value: paymentData.summary.count,
                  color: "bg-gold-dark",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-2xl border border-primary-100 p-4"
                >
                  <div className="text-xs text-primary-lighter mb-1">
                    {s.label}
                  </div>
                  <div
                    className={`text-xl font-display font-bold text-primary`}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-primary-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-primary">Collection Trend</h2>
              <div className="flex gap-2">
                {["area", "bar", "line"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${chartType === t ? "bg-primary text-white" : "bg-primary-50 text-primary"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="h-72 bg-primary-50 rounded-xl animate-pulse" />
            ) : (
              renderPaymentChart()
            )}
          </div>
        </div>
      )}

      {/* Dues Report */}
      {activeTab === "dues" && (
        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
            Students shown here have payments overdue or due within 5 days.
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-36 bg-white rounded-2xl border border-primary-100 animate-pulse"
                />
              ))}
            </div>
          ) : !duesData?.length ? (
            <div className="bg-white rounded-2xl border border-primary-100 py-16 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="font-semibold text-primary">All Clear!</h3>
              <p className="text-primary-lighter text-sm mt-1">
                No students with pending dues
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {duesData.map((s, i) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-2xl border overflow-hidden ${s.hasDues ? "border-red-200" : "border-orange-200"}`}
                >
                  <div
                    className={`h-2 w-full ${s.hasDues ? "bg-red-500" : "bg-orange-400"}`}
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary font-bold overflow-hidden">
                        <StudentAvatar
                          src={photoUrl(s.photo)}
                          imgClassName="w-full h-full object-cover"
                          fallback={<span>{s.fullName?.charAt(0)}</span>}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-primary text-sm">
                          {s.fullName}
                        </p>
                        <p className="text-xs text-primary-lighter">
                          {s.mobile || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-primary-lighter">
                      <div>
                        Last payment:{" "}
                        <span className="text-primary font-medium">
                          {s.lastPaymentDate
                            ? formatDate(s.lastPaymentDate)
                            : "None"}
                        </span>
                      </div>
                      <div>
                        Paid upto:{" "}
                        <span
                          className={`font-medium ${s.hasDues ? "text-red-600" : s.dueSoon ? "text-orange-500" : "text-green-600"}`}
                        >
                          {s.paidThroughDate
                            ? formatDate(s.paidThroughDate, "dd MMM yyyy")
                            : "—"}
                        </span>
                      </div>
                      {s.lastReminderSentAt && (
                        <div>
                          Last reminder sent:{" "}
                          <span className="text-primary font-medium">
                            {formatDateTime(s.lastReminderSentAt)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div
                        className={`flex-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-center ${s.hasDues ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}
                      >
                        {s.hasDues
                          ? "⚠️ Overdue"
                          : `⏰ Due in ${s.daysUntilDue} day${s.daysUntilDue !== 1 ? "s" : ""}`}
                      </div>
                      {canSendReminders && (s.whatsappNumber || s.mobile) && (
                        <a
                          href={buildWaReminderUrl(s)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Send fee reminder on WhatsApp"
                          onClick={() => handleRemind(s._id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-500 hover:text-white transition-all flex-shrink-0"
                        >
                          <WaIcon />
                          Remind
                        </a>
                      )}
                      <Link
                        href={`/admin/students/${s._id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-50 text-primary text-xs font-medium hover:bg-primary hover:text-white transition-all flex-shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Profile
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {duesPagination && duesPagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDuesPage((p) => Math.max(1, p - 1))}
                disabled={duesPage === 1}
                className="w-9 h-9 rounded-xl border border-primary-200 flex items-center justify-center disabled:opacity-40 hover:bg-primary-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-primary-lighter">
                Page {duesPage} of {duesPagination.pages}
              </span>
              <button
                onClick={() =>
                  setDuesPage((p) => Math.min(duesPagination.pages, p + 1))
                }
                disabled={duesPage === duesPagination.pages}
                className="w-9 h-9 rounded-xl border border-primary-200 flex items-center justify-center disabled:opacity-40 hover:bg-primary-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Financials Tab */}
      {activeTab === "financials" && (
        <div className="space-y-6">
          {/* Filters + Add button */}
          <div className="bg-white rounded-2xl border border-primary-100 p-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {FIN_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setFinPreset(p.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${finPreset === p.value ? "bg-primary text-white" : "bg-primary-50 text-primary hover:bg-primary-100"}`}
                >
                  {p.label}
                </button>
              ))}
              {finPreset === "custom" && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <input
                    type="date"
                    value={finCustomStart}
                    onChange={(e) => setFinCustomStart(e.target.value)}
                    className="input-field w-full sm:w-auto text-sm py-2"
                  />
                  <span className="text-primary-lighter text-sm hidden sm:block">
                    to
                  </span>
                  <input
                    type="date"
                    value={finCustomEnd}
                    onChange={(e) => setFinCustomEnd(e.target.value)}
                    className="input-field w-full sm:w-auto text-sm py-2"
                  />
                </div>
              )}
            </div>
            {canManageExpenses && (
              <button
                onClick={() => setShowAddExpense((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all"
              >
                <Plus size={15} />
                Add Expense
              </button>
            )}
          </div>

          {/* Add Expense Form */}
          <AnimatePresence>
            {canManageExpenses && showAddExpense && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-white rounded-2xl border border-primary-100 p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-primary">Add Expense</h3>
                  <button
                    onClick={() => setShowAddExpense(false)}
                    className="text-primary-lighter hover:text-primary transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <form
                  onSubmit={handleAddExpense}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <div>
                    <label className="block text-xs font-medium text-primary-lighter mb-1.5">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="0.00"
                      value={expForm.amount}
                      onChange={(e) =>
                        setExpForm((f) => ({ ...f, amount: e.target.value }))
                      }
                      className="input-field w-full text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-lighter mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={expForm.date}
                      onChange={(e) =>
                        setExpForm((f) => ({ ...f, date: e.target.value }))
                      }
                      className="input-field w-full text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-lighter mb-1.5">
                      Mode
                    </label>
                    <select
                      value={expForm.mode}
                      onChange={(e) =>
                        setExpForm((f) => ({ ...f, mode: e.target.value }))
                      }
                      className="input-field w-full text-sm"
                    >
                      <option value="cash">Cash</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-lighter mb-1.5">
                      Remarks
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Electricity bill"
                      value={expForm.remarks}
                      onChange={(e) =>
                        setExpForm((f) => ({ ...f, remarks: e.target.value }))
                      }
                      className="input-field w-full text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={expSubmitting}
                      className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-all"
                    >
                      {expSubmitting ? "Saving…" : "Save Expense"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary Cards */}
          {finLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-white rounded-2xl border border-primary-100 animate-pulse"
                />
              ))}
            </div>
          ) : (
            financialsData && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-green-200 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <TrendingUp size={16} className="text-green-600" />
                    </div>
                    <span className="text-xs font-medium text-primary-lighter uppercase tracking-wide">
                      Total Earnings
                    </span>
                  </div>
                  <div className="text-2xl font-display font-bold text-green-700">
                    {formatCurrency(financialsData.summary.totalEarnings)}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-red-200 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <TrendingDown size={16} className="text-red-600" />
                    </div>
                    <span className="text-xs font-medium text-primary-lighter uppercase tracking-wide">
                      Total Expenses
                    </span>
                  </div>
                  <div className="text-2xl font-display font-bold text-red-700">
                    {formatCurrency(financialsData.summary.totalExpenses)}
                  </div>
                </div>
                <div
                  className={`rounded-2xl border p-5 ${financialsData.summary.netProfit >= 0 ? "bg-white border-primary-100" : "bg-red-50 border-red-200"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${financialsData.summary.netProfit >= 0 ? "bg-primary-100" : "bg-red-100"}`}
                    >
                      <IndianRupee
                        size={16}
                        className={
                          financialsData.summary.netProfit >= 0
                            ? "text-primary"
                            : "text-red-600"
                        }
                      />
                    </div>
                    <span className="text-xs font-medium text-primary-lighter uppercase tracking-wide">
                      Net Profit
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-display font-bold ${financialsData.summary.netProfit >= 0 ? "text-primary" : "text-red-700"}`}
                  >
                    {financialsData.summary.netProfit < 0 ? "-" : ""}
                    {formatCurrency(Math.abs(financialsData.summary.netProfit))}
                  </div>
                </div>
              </div>
            )
          )}

          {/* Monthly Grouped Bar Chart */}
          {!finLoading && financialsData?.monthlyData?.length > 0 && (
            <div className="bg-white rounded-2xl border border-primary-100 p-5">
              <h2 className="font-semibold text-primary mb-5">
                Monthly Earnings vs Expenses
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={financialsData.monthlyData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5e8e0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: CHART_COLORS.light }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: CHART_COLORS.light }}
                    tickFormatter={(v) =>
                      `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="earnings"
                    name="Earnings"
                    fill={CHART_COLORS.green}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill={CHART_COLORS.red}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="profit"
                    name="Net Profit"
                    fill={CHART_COLORS.gold}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Daily Area Chart */}
          {!finLoading && financialsData?.dailyData?.length > 0 && (
            <div className="bg-white rounded-2xl border border-primary-100 p-5">
              <h2 className="font-semibold text-primary mb-5">
                Daily Activity
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={financialsData.dailyData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="finEarnings"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={CHART_COLORS.green}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={CHART_COLORS.green}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="finExpenses"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={CHART_COLORS.red}
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor={CHART_COLORS.red}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5e8e0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: CHART_COLORS.light }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: CHART_COLORS.light }}
                    tickFormatter={(v) =>
                      `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    name="Earnings"
                    stroke={CHART_COLORS.green}
                    fill="url(#finEarnings)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke={CHART_COLORS.red}
                    fill="url(#finExpenses)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Expenses Table */}
          {!finLoading && financialsData && (
            <div className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
              <div className="p-5 border-b border-primary-50 flex items-center justify-between">
                <h2 className="font-semibold text-primary">Expense Records</h2>
                <span className="text-xs text-primary-lighter">
                  {financialsData.expenses?.length || 0} entries
                </span>
              </div>
              {!financialsData.expenses?.length ? (
                <div className="py-12 text-center text-primary-lighter text-sm">
                  No expenses recorded for this period
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-primary-50">
                        <th className="px-5 py-3 text-left text-xs font-medium text-primary-lighter uppercase tracking-wide">
                          Date
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-primary-lighter uppercase tracking-wide">
                          Amount
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-primary-lighter uppercase tracking-wide">
                          Mode
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-primary-lighter uppercase tracking-wide">
                          Remarks
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-primary-lighter uppercase tracking-wide">
                          Added By
                        </th>
                        <th className="px-2 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-50">
                      {financialsData.expenses.map((exp) => (
                        <tr
                          key={exp._id}
                          className="hover:bg-primary-50/40 transition-colors group"
                        >
                          <td className="px-5 py-3.5 text-primary whitespace-nowrap">
                            {formatDate(exp.date)}
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-primary whitespace-nowrap">
                            {formatCurrency(exp.amount)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${exp.mode === "cash" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}
                            >
                              {exp.mode === "cash" ? (
                                <Banknote size={11} />
                              ) : (
                                <CreditCard size={11} />
                              )}
                              {exp.mode === "cash" ? "Cash" : "Online"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-primary-lighter">
                            {exp.remarks || "—"}
                          </td>
                          <td className="px-5 py-3.5 text-primary-lighter text-xs">
                            {exp.createdBy?.fullName || "—"}
                          </td>
                          <td className="px-2 py-3.5">
                            {canManageExpenses && (
                              <button
                                onClick={() => handleDeleteExpense(exp._id)}
                                disabled={deletingExpId === exp._id}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-40"
                              >
                                {deletingExpId === exp._id ? (
                                  <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Comparison Report */}
      {activeTab === "comparison" && (
        <div className="space-y-6">
          {/* Filter bar */}
          <div className="bg-white rounded-2xl border border-primary-100 p-4 flex flex-wrap gap-3 items-end">
            <div className="flex gap-2">
              <button
                onClick={() => setCompMode("auto")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${compMode === "auto" ? "bg-primary text-white" : "bg-primary-50 text-primary hover:bg-primary-100"}`}
              >
                Auto (Half-month)
              </button>
              <button
                onClick={() => setCompMode("custom")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${compMode === "custom" ? "bg-primary text-white" : "bg-primary-50 text-primary hover:bg-primary-100"}`}
              >
                Custom Range
              </button>
            </div>
            {compMode === "custom" && (
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs font-medium text-primary-lighter whitespace-nowrap w-14">
                    Period 1
                  </span>
                  <input
                    type="date"
                    value={compP1Start}
                    onChange={(e) => setCompP1Start(e.target.value)}
                    className="input-field w-full sm:w-auto text-sm py-2"
                  />
                  <span className="text-primary-lighter text-sm hidden sm:block">
                    to
                  </span>
                  <input
                    type="date"
                    value={compP1End}
                    onChange={(e) => setCompP1End(e.target.value)}
                    className="input-field w-full sm:w-auto text-sm py-2"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs font-medium text-primary-lighter whitespace-nowrap w-14">
                    Period 2
                  </span>
                  <input
                    type="date"
                    value={compP2Start}
                    onChange={(e) => setCompP2Start(e.target.value)}
                    className="input-field w-full sm:w-auto text-sm py-2"
                  />
                  <span className="text-primary-lighter text-sm hidden sm:block">
                    to
                  </span>
                  <input
                    type="date"
                    value={compP2End}
                    onChange={(e) => setCompP2End(e.target.value)}
                    className="input-field w-full sm:w-auto text-sm py-2"
                  />
                </div>
              </div>
            )}
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-white rounded-2xl border border-primary-100 animate-pulse"
                />
              ))}
            </div>
          )}

          {!loading && comparisonData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl border border-primary-100 p-5 text-center">
                  <div className="text-xs text-primary-lighter mb-2 uppercase tracking-wide">
                    {comparisonData.previous?.label}
                  </div>
                  <div className="text-3xl font-display font-bold text-primary-lighter">
                    {formatCurrency(comparisonData.previous?.total)}
                  </div>
                  <div className="text-xs text-primary-lighter mt-1">
                    {comparisonData.previous?.count} transactions
                  </div>
                </div>
                <div
                  className={`rounded-2xl p-5 text-center ${comparisonData.delta >= 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                >
                  <div className="text-xs text-primary-lighter mb-2 uppercase tracking-wide">
                    Delta
                  </div>
                  <div
                    className={`text-3xl font-display font-bold flex items-center justify-center gap-1 ${comparisonData.delta >= 0 ? "text-green-700" : "text-red-700"}`}
                  >
                    {comparisonData.delta >= 0 ? (
                      <TrendingUp className="w-6 h-6" />
                    ) : (
                      <TrendingDown className="w-6 h-6" />
                    )}
                    {formatCurrency(Math.abs(comparisonData.delta))}
                  </div>
                  <div
                    className={`text-sm font-semibold mt-1 ${comparisonData.delta >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {comparisonData.deltaPercent > 0 ? "+" : ""}
                    {comparisonData.deltaPercent}%
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-primary-100 p-5 text-center">
                  <div className="text-xs text-primary-lighter mb-2 uppercase tracking-wide">
                    {comparisonData.current?.label}
                  </div>
                  <div className="text-3xl font-display font-bold text-primary">
                    {formatCurrency(comparisonData.current?.total)}
                  </div>
                  <div className="text-xs text-primary-lighter mt-1">
                    {comparisonData.current?.count} transactions
                  </div>
                </div>
              </div>

              {/* Bar chart comparison */}
              <div className="bg-white rounded-2xl border border-primary-100 p-5">
                <h2 className="font-semibold text-primary mb-5">
                  Period Comparison
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={[
                      {
                        period: comparisonData.previous?.label,
                        amount: comparisonData.previous?.total,
                      },
                      {
                        period: comparisonData.current?.label,
                        amount: comparisonData.current?.total,
                      },
                    ]}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5e8e0" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 12, fill: CHART_COLORS.light }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: CHART_COLORS.light }}
                      tickFormatter={(v) =>
                        `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" name="Amount" radius={[8, 8, 0, 0]}>
                      <Cell fill={CHART_COLORS.light} />
                      <Cell fill={CHART_COLORS.primary} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      )}

      {/* Shift Distribution */}
      {activeTab === "shifts" && (
        <div className="space-y-6">
          {/* Filter bar */}
          <div className="bg-white rounded-2xl border border-primary-100 p-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setShiftActiveOnly(true)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${shiftActiveOnly ? "bg-primary text-white" : "bg-primary-50 text-primary hover:bg-primary-100"}`}
              >
                Active Students
              </button>
              <button
                onClick={() => setShiftActiveOnly(false)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!shiftActiveOnly ? "bg-primary text-white" : "bg-primary-50 text-primary hover:bg-primary-100"}`}
              >
                All Students
              </button>
            </div>
            {shiftData && (
              <span className="text-xs text-primary-lighter">
                {shiftData.studentsWithBatch} with a batch assigned
                {shiftData.studentsWithoutBatch > 0 &&
                  ` · ${shiftData.studentsWithoutBatch} not decided yet`}
              </span>
            )}
          </div>

          {shiftLoading || !shiftData ? (
            <div className="h-72 bg-primary-50 rounded-xl animate-pulse" />
          ) : (
            <>
              {/* Stat cards — students by shift count */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {shiftCounts.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() =>
                      setShiftDrilldown({
                        shiftCount: count,
                        batch: null,
                        label: `${count} Shift${count !== 1 ? "s" : ""}`,
                      })
                    }
                    className="text-left bg-white rounded-2xl border border-primary-100 p-4 hover:border-primary/40 hover:shadow-sm transition-all"
                  >
                    <div className="text-xs text-primary-lighter mb-1">
                      {count} Shift{count !== 1 ? "s" : ""}
                    </div>
                    <div className="text-xl font-display font-bold text-primary">
                      {shiftData.shiftCountTotals[count]}
                    </div>
                  </button>
                ))}
              </div>

              {/* Chart */}
              <div className="bg-white rounded-2xl border border-primary-100 p-5">
                <h2 className="font-semibold text-primary mb-5">
                  Students by Shift Count
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={shiftCounts.map((count) => ({
                      name: `${count} Shift${count !== 1 ? "s" : ""}`,
                      total: shiftData.shiftCountTotals[count],
                    }))}
                    margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f5e8e0"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: CHART_COLORS.light }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: CHART_COLORS.light }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="total"
                      name="Students"
                      radius={[8, 8, 0, 0]}
                      fill={CHART_COLORS.primary}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Cross-tab: batch x shift-count */}
              <div className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
                <div className="p-5 border-b border-primary-50">
                  <h2 className="font-semibold text-primary">
                    Batch Breakdown
                  </h2>
                  <p className="text-xs text-primary-lighter mt-0.5">
                    Each cell is students with exactly that many shifts who
                    include that batch. &ldquo;Total&rdquo; is students in
                    that batch regardless of shift count.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-primary-50">
                        <th className="px-5 py-3 text-left text-xs font-medium text-primary-lighter uppercase tracking-wide">
                          Batch
                        </th>
                        {shiftCounts.map((count) => (
                          <th
                            key={count}
                            className="px-5 py-3 text-center text-xs font-medium text-primary-lighter uppercase tracking-wide whitespace-nowrap"
                          >
                            {count} Shift{count !== 1 ? "s" : ""}
                          </th>
                        ))}
                        <th className="px-5 py-3 text-right text-xs font-medium text-primary-lighter uppercase tracking-wide">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-50">
                      {shiftData.batches.map((batch) => (
                        <tr
                          key={batch}
                          className="hover:bg-primary-50/40 transition-colors"
                        >
                          <td className="px-5 py-3.5 text-primary font-medium whitespace-nowrap">
                            {batch}
                          </td>
                          {shiftCounts.map((count) => {
                            const value = shiftData.matrix[count]?.[batch] || 0;
                            return (
                              <td
                                key={count}
                                onClick={() =>
                                  value > 0 &&
                                  setShiftDrilldown({
                                    shiftCount: count,
                                    batch,
                                    label: `${batch} · ${count} Shift${count !== 1 ? "s" : ""}`,
                                  })
                                }
                                className={`px-5 py-3.5 text-center text-primary-lighter ${
                                  value > 0 ? "cursor-pointer hover:bg-primary-100/60 hover:text-primary font-medium" : ""
                                }`}
                              >
                                {value}
                              </td>
                            );
                          })}
                          <td
                            onClick={() =>
                              (shiftData.batchTotals[batch] || 0) > 0 &&
                              setShiftDrilldown({ shiftCount: null, batch, label: batch })
                            }
                            className={`px-5 py-3.5 text-right font-bold text-primary ${
                              (shiftData.batchTotals[batch] || 0) > 0 ? "cursor-pointer hover:bg-primary-100/60" : ""
                            }`}
                          >
                            {shiftData.batchTotals[batch] || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-primary-100 bg-primary-50/40">
                        <td className="px-5 py-3.5 font-bold text-primary">
                          Total Students
                        </td>
                        {shiftCounts.map((count) => (
                          <td
                            key={count}
                            onClick={() =>
                              setShiftDrilldown({
                                shiftCount: count,
                                batch: null,
                                label: `${count} Shift${count !== 1 ? "s" : ""}`,
                              })
                            }
                            className="px-5 py-3.5 text-center font-bold text-primary cursor-pointer hover:bg-primary-100/60"
                          >
                            {shiftData.shiftCountTotals[count]}
                          </td>
                        ))}
                        <td
                          onClick={() =>
                            setShiftDrilldown({ shiftCount: null, batch: null, label: "All Students With a Batch" })
                          }
                          className="px-5 py-3.5 text-right font-bold text-primary cursor-pointer hover:bg-primary-100/60"
                        >
                          {shiftData.studentsWithBatch}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Shift drill-down modal */}
      <AnimatePresence>
        {shiftDrilldown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShiftDrilldown(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-primary to-primary-light px-5 py-4 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-white font-display font-bold text-base">
                    {shiftDrilldown.label}
                  </h2>
                  <p className="text-white/70 text-xs mt-0.5">
                    {drilldownStudents.length} student
                    {drilldownStudents.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setShiftDrilldown(null)}
                  className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors flex-shrink-0"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="overflow-y-auto divide-y divide-primary-50">
                {drilldownStudents.length === 0 ? (
                  <div className="py-12 text-center text-primary-lighter text-sm">
                    No students match this filter
                  </div>
                ) : (
                  drilldownStudents.map((s) => (
                    <div
                      key={s._id}
                      className="p-4 flex items-center gap-3 hover:bg-primary-50/40 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary font-bold overflow-hidden flex-shrink-0">
                        <StudentAvatar
                          src={photoUrl(s.photo)}
                          imgClassName="w-full h-full object-cover"
                          fallback={<span>{s.fullName?.charAt(0)}</span>}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-primary text-sm truncate">
                            {s.fullName}
                          </p>
                          {!s.isActive && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 flex-shrink-0">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-primary-lighter">
                          {s.mobile || "—"}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(s.seatAssignments || []).map((a) => {
                            const isFlexi = !a.seatNumber;
                            return (
                              <span
                                key={a.batch}
                                className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                                  isFlexi
                                    ? "bg-orange-100 text-orange-700 ring-1 ring-orange-300"
                                    : "bg-primary-50 text-primary"
                                }`}
                              >
                                <Armchair className="w-2.5 h-2.5" />
                                {a.batch}
                                {isFlexi ? " · Flexi" : ` (${a.seatNumber})`}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <Link
                        href={`/admin/students/${s._id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-50 text-primary text-xs font-medium hover:bg-primary hover:text-white transition-all flex-shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Profile
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
