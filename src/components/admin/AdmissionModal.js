"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  IndianRupee,
  Calendar,
  Upload,
  Camera,
  CreditCard,
  Banknote,
  CheckCircle,
  CalendarCheck,
  ArrowRight,
  Loader2,
  Phone,
  Plus,
  Trash2,
  Armchair,
} from "lucide-react";

const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);
import toast from "react-hot-toast";
import api from "@/lib/api";
import {
  MONTH_NAMES,
  formatCurrency,
  BATCHES,
  SHIFT_FEES,
  NIGHT_SHIFT,
  NIGHT_SHIFT_FEE,
  computeStandardFee,
  blockNumberSpin,
} from "@/lib/utils";
import { addMonths, addDays, format } from "date-fns";
import CameraCapture from "./CameraCapture";

function buildCoveredMonths(startYear, startMonth, count) {
  const months = [];
  let y = startYear,
    m = startMonth;
  for (let i = 0; i < count; i++) {
    months.push({ year: y, month: m, label: `${MONTH_NAMES[m - 1]} ${y}` });
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return months;
}

const CURRENT = new Date();

export default function AdmissionModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [updatingPhoto, setUpdatingPhoto] = useState(false);
  const [createdStudent, setCreatedStudent] = useState(null);

  const [studentForm, setStudentForm] = useState({
    fullName: "",
    mobile: "",
    whatsappNumber: "",
    email: "",
    address: "",
    admissionDate: CURRENT.toISOString().split("T")[0],
    libraryFees: "",
    password: "",
  });
  const [seatAssignments, setSeatAssignments] = useState([]);
  const [feeTouched, setFeeTouched] = useState(false);
  const [whatsappSameAsMobile, setWhatsappSameAsMobile] = useState(false);

  // Auto-fill libraryFees from standard rate when batches change,
  // unless admin has manually overridden the fee field.
  useEffect(() => {
    if (feeTouched) return;
    const selectedBatches = seatAssignments.filter((r) => r.batch).map((r) => r.batch);
    const standard = computeStandardFee(selectedBatches);
    if (standard) setStudentForm((f) => ({ ...f, libraryFees: String(standard) }));
  }, [seatAssignments, feeTouched]);

  const addSeatRow = () =>
    setSeatAssignments((rows) => [...rows, { batch: "", seatNumber: "" }]);
  const removeSeatRow = (index) =>
    setSeatAssignments((rows) => rows.filter((_, i) => i !== index));
  const updateSeatRow = (index, field, value) =>
    setSeatAssignments((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );

  const [paymentForm, setPaymentForm] = useState({
    addPayment: true,
    amount: "",
    mode: "cash",
    referenceNo: "",
    receivedDate: CURRENT.toISOString().split("T")[0],
  });
  const [numMonths, setNumMonths] = useState(1);
  const [monthsTouched, setMonthsTouched] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
  };

  const handlePhotoCapture = (file) => {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setShowCamera(false);
  };

  const handlePhotoUpdateStep2 = async (file) => {
    if (!file || !createdStudent) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setUpdatingPhoto(true);
    try {
      const fd = new FormData();
      Object.entries(studentForm).forEach(([k, v]) => v && fd.append(k, v));
      fd.append("photo", file);
      await api.put(`/students/${createdStudent._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Photo updated!");
    } catch (err) {
      console.error("[AdmissionModal step2] photo update failed:", err);
      toast.error("Failed to update photo");
    } finally {
      setUpdatingPhoto(false);
    }
  };

  const handlePhotoCaptureStep2 = (file) => {
    setShowCamera(false);
    handlePhotoUpdateStep2(file);
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();

    const validRows = seatAssignments.filter((r) => r.batch);
    if (validRows.length === 0) {
      return toast.error("Select at least one batch");
    }
    const batchesUsed = validRows.map((r) => r.batch);
    if (new Set(batchesUsed).size !== batchesUsed.length) {
      return toast.error(
        "Only one seat can be assigned per batch — remove the duplicate batch row",
      );
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(studentForm).forEach(([k, v]) => v && fd.append(k, v));
      fd.append("seatAssignments", JSON.stringify(validRows));
      if (photoFile) fd.append("photo", photoFile);

      const { data } = await api.post("/students", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCreatedStudent(data.student);
      toast.success("Student admitted successfully!");

      if (paymentForm.addPayment) {
        setStep(2);
      } else {
        onSuccess();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to admit student");
    } finally {
      setLoading(false);
    }
  };

  const adjustMonths = (delta) => {
    setMonthsTouched(true);
    setNumMonths((m) => Math.max(1, m + delta));
  };
  const handleMonthsInput = (e) => {
    setMonthsTouched(true);
    setNumMonths(Math.max(1, parseInt(e.target.value) || 1));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!createdStudent) return;
    const parsedAmt = parseFloat(paymentForm.amount) || 0;
    if (parsedAmt <= 0) return toast.error("Enter a valid amount");
    const admDate = studentForm.admissionDate
      ? new Date(studentForm.admissionDate)
      : CURRENT;
    const startYear = admDate.getFullYear();
    const startMonth = admDate.getMonth() + 1;
    setLoading(true);
    try {
      await api.post("/payments", {
        studentId: createdStudent._id,
        amount: parsedAmt,
        mode: paymentForm.mode,
        referenceNo: paymentForm.referenceNo.trim() || undefined,
        receivedDate: paymentForm.receivedDate,
        startYear,
        startMonth,
        numMonths,
      });
      toast.success("Payment recorded!");
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const sf = (k) => (e) =>
    setStudentForm((f) => ({ ...f, [k]: e.target.value }));
  const pf = (k) => (e) =>
    setPaymentForm((f) => ({ ...f, [k]: e.target.value }));

  const validBatchRows = seatAssignments.filter((r) => r.batch);
  const canSubmitStudent =
    studentForm.fullName.trim() !== "" &&
    studentForm.admissionDate !== "" &&
    studentForm.libraryFees !== "" &&
    validBatchRows.length > 0;

  // Suggest floor(amount / fee) months (e.g. 700 at a 300 fee -> 2 months).
  // The admin can still adjust manually for bundle/discounted pricing.
  const paymentFee = parseFloat(studentForm.libraryFees) || 0;
  const paymentParsedAmt = parseFloat(paymentForm.amount) || 0;
  const suggestedMonths =
    paymentFee > 0 && paymentParsedAmt > 0
      ? Math.max(1, Math.floor(paymentParsedAmt / paymentFee))
      : 1;
  // Re-suggests whenever the amount changes, even if the admin had manually
  // adjusted months for a previous amount (see handlePaymentAmountChange below).
  useEffect(() => {
    if (!monthsTouched) setNumMonths(suggestedMonths);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedMonths, monthsTouched]);

  const handlePaymentAmountChange = (e) => {
    pf("amount")(e);
    setMonthsTouched(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-light p-6 rounded-t-3xl flex items-center justify-between">
          <div>
            <h2 className="text-white font-display font-bold text-xl">
              {step === 1 ? "Student Admission" : "Record Initial Payment"}
            </h2>
            <p className="text-white/70 text-sm mt-0.5">
              {step === 1
                ? "Fill in student details to register"
                : `For: ${createdStudent?.fullName}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleStudentSubmit} className="space-y-5">
              {/* Photo upload */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-primary-50 border-2 border-dashed border-primary-200 flex items-center justify-center overflow-hidden relative">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-primary-lighter" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 rounded-xl text-primary text-sm font-medium transition-colors border border-primary-200">
                      <Upload className="w-4 h-4" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 rounded-xl text-primary text-sm font-medium transition-colors border border-primary-200"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                  </div>
                  <p className="text-primary-lighter text-xs mt-1">
                    Optional, Max 5MB, JPG/PNG
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-primary mb-1.5">
                    Full Name *
                  </label>
                  <input
                    required
                    value={studentForm.fullName}
                    onChange={sf("fullName")}
                    placeholder="Student full name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    value={studentForm.mobile}
                    onChange={(e) => {
                      sf("mobile")(e);
                      if (whatsappSameAsMobile)
                        setStudentForm((f) => ({
                          ...f,
                          whatsappNumber: e.target.value,
                        }));
                    }}
                    placeholder="e.g. 9876543210"
                    className="input-field"
                  />
                  <p className="text-xs text-primary-lighter mt-1">
                    Used as login username
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5 flex items-center gap-1.5">
                    <WhatsAppIcon size={13} /> WhatsApp Number (Optional)
                  </label>
                  <input
                    value={
                      whatsappSameAsMobile
                        ? studentForm.mobile
                        : studentForm.whatsappNumber
                    }
                    onChange={sf("whatsappNumber")}
                    disabled={whatsappSameAsMobile}
                    placeholder="e.g. 9876543210"
                    className="input-field disabled:bg-primary-50 disabled:text-primary-lighter"
                  />
                  <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      checked={whatsappSameAsMobile}
                      onChange={(e) => {
                        setWhatsappSameAsMobile(e.target.checked);
                        if (e.target.checked)
                          setStudentForm((f) => ({
                            ...f,
                            whatsappNumber: f.mobile,
                          }));
                      }}
                      className="w-3.5 h-3.5 accent-green-600"
                    />
                    <span className="text-xs text-primary-lighter">
                      Same as mobile
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={sf("email")}
                    placeholder="student@example.com"
                    className="input-field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-primary mb-1.5">
                    Address (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={studentForm.address}
                    onChange={sf("address")}
                    placeholder="Full address"
                    className="input-field resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5">
                    Admission Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={studentForm.admissionDate}
                    onChange={sf("admissionDate")}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5">
                    Monthly Fees (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={studentForm.libraryFees}
                    onChange={(e) => { sf("libraryFees")(e); setFeeTouched(true); }}
                    {...blockNumberSpin}
                    placeholder="e.g. 300"
                    className="input-field"
                  />
                  {(() => {
                    const selectedBatches = validBatchRows.map((r) => r.batch);
                    const standard = computeStandardFee(selectedBatches);
                    if (!selectedBatches.length || !standard) return null;
                    const hasNight = selectedBatches.includes(NIGHT_SHIFT);
                    const dayCount = selectedBatches.filter((b) => b !== NIGHT_SHIFT).length;
                    let hint;
                    if (hasNight && dayCount > 0) {
                      hint = `Night ₹${NIGHT_SHIFT_FEE} + ${dayCount} day shift${dayCount > 1 ? 's' : ''} ₹${SHIFT_FEES[dayCount]} = ${formatCurrency(standard)}`;
                    } else if (hasNight) {
                      hint = `Night shift standard: ${formatCurrency(standard)}`;
                    } else {
                      hint = `Standard for ${dayCount} shift${dayCount > 1 ? 's' : ''}: ${formatCurrency(standard)}`;
                    }
                    const isCustom = feeTouched && parseFloat(studentForm.libraryFees) !== standard;
                    return (
                      <p className="text-xs text-primary-lighter mt-1">
                        {hint}
                        {isCustom && (
                          <button type="button"
                            onClick={() => { setStudentForm((f) => ({ ...f, libraryFees: String(standard) })); setFeeTouched(false); }}
                            className="ml-2 text-primary underline underline-offset-2">
                            Reset to standard
                          </button>
                        )}
                      </p>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5">
                    Password
                  </label>
                  <input
                    value={studentForm.password}
                    onChange={sf("password")}
                    placeholder="Default: 123456"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Batch assignments — a student can belong to multiple batches; seat is optional per batch */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-primary flex items-center gap-1.5">
                    <Armchair className="w-3.5 h-3.5" /> Batch(es) *
                  </label>
                  <button
                    type="button"
                    onClick={addSeatRow}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Batch
                  </button>
                </div>
                {seatAssignments.length === 0 ? (
                  <p className="text-xs text-red-500">
                    At least one batch is required — click &ldquo;Add
                    Batch&rdquo; to assign one.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {seatAssignments.map((row, i) => {
                      const otherBatches = seatAssignments
                        .filter((_, idx) => idx !== i)
                        .map((r) => r.batch);
                      const availableBatches = BATCHES.filter(
                        (b) => b === row.batch || !otherBatches.includes(b),
                      );
                      return (
                      <div key={i} className="flex gap-2 items-center">
                        <select
                          value={row.batch}
                          onChange={(e) =>
                            updateSeatRow(i, "batch", e.target.value)
                          }
                          className="input-field flex-1 min-w-[160px] truncate"
                        >
                          <option value="">Select batch *</option>
                          {availableBatches.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                        <input
                          value={row.seatNumber}
                          onChange={(e) =>
                            updateSeatRow(i, "seatNumber", e.target.value)
                          }
                          placeholder="Seat no. (optional)"
                          className="input-field w-32 flex-shrink-0"
                        />
                        <button
                          type="button"
                          onClick={() => removeSeatRow(i)}
                          className="p-2.5 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Option to add payment */}
              <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl border border-primary-100">
                <input
                  type="checkbox"
                  id="addPayment"
                  checked={paymentForm.addPayment}
                  onChange={(e) =>
                    setPaymentForm((f) => ({
                      ...f,
                      addPayment: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-primary"
                />
                <label
                  htmlFor="addPayment"
                  className="text-sm text-primary font-medium cursor-pointer"
                >
                  Record admission day payment as next step
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-primary-200 text-primary text-sm font-medium hover:bg-primary-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !canSubmitStudent}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Admit Student"
                  )}
                </button>
              </div>
            </form>
          ) : (
            (() => {
              const fee = paymentFee;
              const parsedAmt = paymentParsedAmt;
              const admDate = studentForm.admissionDate
                ? new Date(studentForm.admissionDate)
                : CURRENT;
              const startYear = admDate.getFullYear();
              const startMonth = admDate.getMonth() + 1;
              const covered =
                parsedAmt > 0
                  ? buildCoveredMonths(startYear, startMonth, numMonths)
                  : [];
              const remainder = fee > 0 ? parsedAmt - fee * numMonths : 0;
              const newPaidThrough =
                parsedAmt > 0 ? addMonths(admDate, numMonths) : null;
              const newNextDue = newPaidThrough
                ? addDays(newPaidThrough, 1)
                : null;
              const paidThroughStr = newPaidThrough
                ? format(newPaidThrough, "MMM d, yyyy")
                : null;
              const dueDateStr = newNextDue
                ? format(newNextDue, "MMMM d, yyyy")
                : null;

              return (
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Student admitted! Now record the initial payment below.
                  </div>

                  {/* Photo edit after admission */}
                  <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-100">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-primary-200 flex items-center justify-center flex-shrink-0">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-primary-lighter" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-primary mb-1.5">Student Photo</p>
                      <div className="flex gap-2 flex-wrap">
                        <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-primary-100 rounded-lg text-primary text-xs font-medium transition-colors border border-primary-200">
                          <Upload className="w-3.5 h-3.5" />
                          {photoPreview ? "Change" : "Upload"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files[0];
                              if (f) handlePhotoUpdateStep2(f);
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowCamera(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-primary-100 rounded-lg text-primary text-xs font-medium transition-colors border border-primary-200"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          Camera
                        </button>
                        {updatingPhoto && (
                          <span className="flex items-center gap-1 text-xs text-primary-lighter">
                            <div className="w-3 h-3 border-2 border-primary-200 border-t-primary rounded-full animate-spin" />
                            Saving…
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wide">
                      Amount Received (₹)
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-lighter pointer-events-none" />
                      <input
                        type="number"
                        required
                        min="1"
                        value={paymentForm.amount}
                        onChange={handlePaymentAmountChange}
                        {...blockNumberSpin}
                        placeholder={fee > 0 ? `e.g. ${fee}` : "0"}
                        className="input-field pl-9 text-2xl font-bold tracking-tight"
                        style={{ fontSize: "1.4rem" }}
                        autoFocus
                      />
                    </div>
                    {fee > 0 && (
                      <p className="text-xs text-primary-lighter mt-1.5">
                        Monthly fee:{" "}
                        <strong className="text-primary">
                          {formatCurrency(fee)}
                        </strong>
                        {parsedAmt > 0 && (
                          <span className="ml-2">
                            → {formatCurrency(fee)} × {numMonths} ={" "}
                            {formatCurrency(fee * numMonths)}
                            {remainder > 0 && (
                              <span className="text-orange-500">
                                {" "}
                                (+{formatCurrency(remainder)} extra)
                              </span>
                            )}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Months to cover — editable for bundle/discounted pricing */}
                  <div>
                    <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wide">
                      Months to Cover
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => adjustMonths(-1)}
                        disabled={numMonths <= 1}
                        className="w-10 h-10 rounded-xl border border-primary-200 text-primary font-bold text-lg hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={numMonths}
                        onChange={handleMonthsInput}
                        {...blockNumberSpin}
                        className="input-field w-16 text-center font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => adjustMonths(1)}
                        className="w-10 h-10 rounded-xl border border-primary-200 text-primary font-bold text-lg hover:bg-primary-50 transition-colors"
                      >
                        +
                      </button>
                      {monthsTouched && suggestedMonths !== numMonths && (
                        <button
                          type="button"
                          onClick={() => {
                            setMonthsTouched(false);
                            setNumMonths(suggestedMonths);
                          }}
                          className="text-xs text-primary-lighter hover:text-primary underline underline-offset-2"
                        >
                          Reset to {suggestedMonths} (suggested)
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-primary-lighter mt-1.5">
                      Adjust manually for bundle/discounted pricing (e.g. ₹500
                      for 2 months).
                    </p>
                  </div>

                  {/* Live preview */}
                  <AnimatePresence>
                    {parsedAmt > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-2xl border-2 border-primary/20 bg-primary-50 divide-y divide-primary-100 overflow-hidden">
                          <div className="px-4 py-3 flex items-start gap-3">
                            <CalendarCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-primary-lighter uppercase tracking-wide mb-1.5">
                                Covers
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {covered.map((mc) => (
                                  <span
                                    key={`${mc.year}-${mc.month}`}
                                    className="px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-lg"
                                  >
                                    {mc.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="px-4 py-3 flex items-center gap-2 text-sm flex-wrap">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-primary-lighter">
                              Paid upto
                            </span>
                            <span className="font-bold text-primary">
                              {paidThroughStr}
                            </span>
                            <ArrowRight className="w-3 h-3 text-primary-lighter mx-0.5" />
                            <span className="text-primary-lighter text-xs">
                              Next due
                            </span>
                            <span className="font-bold text-primary text-xs">
                              {dueDateStr}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mode */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentForm((f) => ({ ...f, mode: "cash" }))
                      }
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                        paymentForm.mode === "cash"
                          ? "bg-green-50 border-green-500 text-green-700"
                          : "bg-white border-primary-200 text-primary-lighter hover:border-primary/40"
                      }`}
                    >
                      <Banknote className="w-4 h-4" /> Cash
                      {paymentForm.mode === "cash" && (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentForm((f) => ({ ...f, mode: "online" }))
                      }
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                        paymentForm.mode === "online"
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "bg-white border-primary-200 text-primary-lighter hover:border-primary/40"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" /> Online
                      {paymentForm.mode === "online" && (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Reference (online only) */}
                  <AnimatePresence>
                    {paymentForm.mode === "online" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <input
                          value={paymentForm.referenceNo}
                          onChange={pf("referenceNo")}
                          placeholder="UPI / Bank reference number"
                          className="input-field text-sm"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Date */}
                  <input
                    type="date"
                    value={paymentForm.receivedDate}
                    onChange={pf("receivedDate")}
                    className="input-field text-sm"
                  />

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onSuccess}
                      className="flex-1 px-4 py-3 rounded-xl border border-primary-200 text-primary text-sm font-medium hover:bg-primary-50 transition-colors"
                    >
                      Skip
                    </button>
                    <button
                      type="submit"
                      disabled={loading || parsedAmt <= 0}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {loading
                        ? "Recording…"
                        : `Record ${parsedAmt > 0 ? formatCurrency(parsedAmt) : ""} Payment`}
                    </button>
                  </div>
                </form>
              );
            })()
          )}
        </div>
      </motion.div>

      {showCamera && (
        <CameraCapture
          onClose={() => setShowCamera(false)}
          onCapture={step === 1 ? handlePhotoCapture : handlePhotoCaptureStep2}
        />
      )}
    </div>
  );
}
