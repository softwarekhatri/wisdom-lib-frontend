"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  ChevronDown,
  ChevronUp,
  Camera,
  Upload,
  Check,
  X,
  User,
  Phone,
  MapPin,
  Clock,
  Armchair,
  CheckCircle,
  Loader2,
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://wisdom-library-backend.vercel.app/api";
const HIDDEN_BATCHES = new Set(["10 PM - 6 AM"]);
const UPI_ID = "6299803624@naviaxis";
const UPI_NUMBER = "6299803624";
const UPI_NAME = "ADITYA RAJ";
const WA_NUMBER = "917209703947";
const BLOCKED = new Set(["48", "51"]);
const TOTAL_SEATS = Array.from({ length: 67 }, (_, i) => String(i + 1)).filter(
  (n) => !BLOCKED.has(n),
);
const SHIFT_FEES = [0, 300, 500, 750, 1000];

const WhatsAppIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

function SeatGrid({ bookedSeats }) {
  const booked = new Set(bookedSeats || []);
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {TOTAL_SEATS.map((n) => {
        const isBooked = booked.has(n);
        return (
          <div
            key={n}
            title={isBooked ? `Seat ${n} — Booked` : `Seat ${n} — Available`}
            className={`w-8 h-8 rounded-lg text-[11px] font-bold flex items-center justify-center border transition-all ${
              isBooked
                ? "bg-red-100 border-red-300 text-red-500"
                : "bg-green-50 border-green-300 text-green-700"
            }`}
          >
            {n}
          </div>
        );
      })}
    </div>
  );
}

function BatchAvailability({ batches, bookedSeats }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-2">
      {batches.map((batch) => {
        const booked = (bookedSeats[batch] || []).length;
        const available = TOTAL_SEATS.length - booked;
        const isOpen = open === batch;
        return (
          <div
            key={batch}
            className="border border-primary-100 rounded-xl overflow-hidden bg-white"
          >
            <button
              onClick={() => setOpen(isOpen ? null : batch)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary-lighter" />
                <span className="text-sm font-semibold text-primary">
                  {batch}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  {available} available
                </span>
                <span className="text-xs text-primary-lighter">
                  {booked} booked
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-primary-lighter" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-primary-lighter" />
                )}
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-primary-50">
                    <div className="flex items-center gap-4 mt-3 mb-2 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" />{" "}
                        Available
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" />{" "}
                        Booked
                      </span>
                    </div>
                    <SeatGrid batch={batch} bookedSeats={bookedSeats[batch]} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function CameraModal({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      } catch {
        setError(
          "Could not access camera. Please check permissions or use Upload instead.",
        );
      }
    };
    start();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `photo_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
      },
      "image/jpeg",
      0.92,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-semibold text-sm text-gray-800">
            Take Photo
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="relative bg-black aspect-video flex items-center justify-center">
          {error ? (
            <p className="text-red-400 text-sm text-center px-4">{error}</p>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
          {!ready && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="sr-only" />
        <div className="p-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={capture}
            disabled={!ready}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" /> Capture
          </button>
        </div>
      </div>
    </div>
  );
}

function PhotoPicker({ onChange }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    onChange(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleCapture = (file) => {
    setShowCamera(false);
    handleFile(file);
  };

  const clear = () => {
    onChange(null);
    setPreview(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Photo
      </label>
      {preview ? (
        <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-primary">
          <img
            src={preview}
            alt="preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 text-sm hover:border-primary hover:text-primary transition-colors"
          >
            <Upload className="w-4 h-4" /> Upload
          </button>
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 text-sm hover:border-primary hover:text-primary transition-colors"
          >
            <Camera className="w-4 h-4" /> Camera
          </button>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {showCamera && (
        <CameraModal
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
      <p className="text-xs text-gray-400 mt-1">
        Required — helps admin verify your identity
      </p>
    </div>
  );
}

function UpiRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
      <span className="text-xs text-amber-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-amber-900 select-all">{value}</span>
        <button
          type="button"
          onClick={copy}
          title={`Copy ${label}`}
          className="text-amber-500 hover:text-amber-800 transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function SuccessScreen({ name, mobile, batches, seatNumbers, fee }) {
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${fee}&cu=INR`;
  const qrSrc = `https://res.cloudinary.com/plpnaehl/image/upload/v1786730924/QR_nspiju.jpg`;

  const batchLines = (batches || [])
    .map((b) => {
      const seat = seatNumbers?.[b];
      return seat ? `${b} — Seat ${seat}` : b;
    })
    .join(", ");

  const waMessage = encodeURIComponent(
    `Hi! I have made the payment for my library admission.\n\nName: ${name}\nMobile: ${mobile}\n${(batches || []).length > 1 ? "Batches" : "Batch"}: ${batchLines}\nAmount: ₹${fee}/month\n\nPlease find the payment screenshot attached.`,
  );
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${waMessage}`;

  const UPI_APPS = [
    {
      name: "GPay",
      logo: "https://img.icons8.com/?size=100&id=BsiNqIHwKUq8&format=png&color=000000",
      color: "#1a73e8",
    },
    {
      name: "PhonePe",
      logo: "https://img.icons8.com/?size=100&id=OYtBxIlJwMGA&format=png&color=000000",
      color: "#5f259f",
    },
    {
      name: "Paytm",
      logo: "https://img.icons8.com/?size=100&id=68067&format=png&color=000000",
      color: "#002970",
    },
    {
      name: "BHIM",
      logo: "https://img.icons8.com/?size=100&id=5RcHTSNy4fbL&format=png&color=000000",
      color: "#00549e",
    },
    {
      name: "Navi",
      logo: "https://www.google.com/s2/favicons?sz=128&domain=navi.com",
      color: "#ff5722",
    },
    {
      name: "Amazon Pay",
      logo: "https://img.icons8.com/?size=100&id=21295&format=png&color=000000",
      color: "#ff9900",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <CheckCircle className="w-9 h-9 text-green-600" />
      </div>

      {/* Bilingual heading */}
      <h2 className="text-xl font-display font-bold text-primary">
        Request Submitted!
      </h2>
      <p className="text-xs text-primary-lighter font-medium mb-3">
        अनुरोध सबमिट हो गया!
      </p>

      {/* Bilingual description */}
      <div className="text-left bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 space-y-1">
        <p className="text-xs text-green-800">
          ✓ Pay below to confirm your seat. Seat activates after admin verifies
          payment.
        </p>
        <p className="text-xs text-green-700">
          ✓ नीचे भुगतान करें — एडमिन जाँच के बाद सीट सक्रिय होगी।
        </p>
      </div>

      {/* Amount to pay */}
      {fee > 0 && (
        <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-5">
          <div className="text-left">
            <p className="text-sm font-semibold text-primary">Amount to Pay</p>
            <p className="text-xs text-primary-lighter">
              भुगतान राशि · per month / प्रति माह
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-primary">₹{fee}</p>
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
        <p className="text-sm font-semibold text-amber-800 mb-1">
          Pay via UPI · UPI से भुगतान करें
        </p>
        <p className="text-xs text-amber-600 mb-3">
          Scan QR or open any app below · QR स्कैन करें या ऐप खोलें
          {fee > 0 && (
            <span className="font-bold text-amber-700"> · ₹{fee}</span>
          )}
        </p>

        <img
          src={qrSrc}
          alt="UPI QR Code"
          width={180}
          height={180}
          className="mx-auto rounded-xl border border-amber-200 mb-3"
        />
        <div className="space-y-1.5 mb-4 text-left">
          <UpiRow label="UPI Number" value={UPI_NUMBER} />
          <UpiRow label="UPI ID" value={UPI_ID} />
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            <span className="text-xs text-amber-600">UPI Name</span>
            <span className="text-sm font-black text-green-700 tracking-wide">{UPI_NAME}</span>
          </div>
        </div>

        {/* "Open Any UPI App" — highlight label, not a button */}
        <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-100 border border-amber-300 mb-4">
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#92400e"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
          <span className="text-amber-800 font-semibold text-sm">
            Open Any UPI App to Pay
          </span>
        </div>

        {/* UPI app logos — each is a deep link */}
        <div className="flex items-end justify-center gap-4 flex-wrap">
          {UPI_APPS.map((app) => (
            <a
              key={app.name}
              href={upiUrl}
              title={`Pay with ${app.name}`}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-11 h-11 group-hover:scale-110 transition-transform flex items-center justify-center">
                {app.logo ? (
                  <img
                    src={app.logo}
                    alt={app.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling &&
                        (e.target.nextSibling.style.display = "flex");
                    }}
                  />
                ) : null}
                <div
                  className={`${app.logo ? "hidden" : "flex"} w-full h-full items-center justify-center text-white font-black text-base`}
                  style={{ backgroundColor: app.color }}
                >
                  {app.name[0]}
                </div>
              </div>
              <span className="text-[9px] text-amber-700 font-medium">
                {app.name}
              </span>
            </a>
          ))}
        </div>
        <p className="text-[10px] text-amber-500 mt-3">
          Tap any app icon · मोबाइल पर टैप करें
        </p>
      </div>

      {/* WhatsApp button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center gap-1 w-full px-4 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors shadow-sm shadow-green-200"
      >
        <div className="flex items-center gap-2">
          <WhatsAppIcon />
          <p className="text-sm font-semibold">
            I have made the payment, share screenshot
          </p>
        </div>
        <p className="text-xl font-black tracking-wide text-white">
          +91 {WA_NUMBER.replace("91", "")}
        </p>
      </a>
      <p className="text-xs text-gray-400 mt-2">
        Screenshot भेजने पर जल्दी verify होगा
      </p>
    </motion.div>
  );
}

export default function AdmissionPage() {
  const [batches, setBatches] = useState([]);
  const [bookedSeats, setBookedSeats] = useState({});
  const [seatsLoading, setSeatsLoading] = useState(true);

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    whatsappNumber: "",
    address: "",
    selectedBatches: [],
    seatNumbers: {},
  });
  const [wasSame, setWasSame] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const sf = (field) => (e) => {
    const isPhone = field === "mobile" || field === "whatsappNumber";
    const val = isPhone
      ? e.target.value.replace(/\D/g, "").slice(0, 10)
      : e.target.value;
    setForm((f) => {
      const next = { ...f, [field]: val };
      if (field === "mobile" && wasSame) next.whatsappNumber = val;
      return next;
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, sRes] = await Promise.all([
          axios.get(`${API_BASE}/public/batches`),
          axios.get(`${API_BASE}/public/seats`),
        ]);
        setBatches(
          (bRes.data.batches || []).filter((b) => !HIDDEN_BATCHES.has(b)),
        );
        setBookedSeats(sRes.data.bookedSeats || {});
      } catch {}
      setSeatsLoading(false);
    };
    load();
  }, []);

  const availableForBatch = (batch) => {
    if (!batch) return [];
    const booked = new Set(bookedSeats[batch] || []);
    return TOTAL_SEATS.filter((n) => !booked.has(n));
  };

  const fee = SHIFT_FEES[Math.min(form.selectedBatches.length, 4)] || 0;

  const toggleBatch = (batch) => {
    setForm((f) => {
      const already = f.selectedBatches.includes(batch);
      const selectedBatches = already
        ? f.selectedBatches.filter((b) => b !== batch)
        : [...f.selectedBatches, batch];
      const seatNumbers = { ...f.seatNumbers };
      if (already) delete seatNumbers[batch];
      return { ...f, selectedBatches, seatNumbers };
    });
  };

  const setSeat = (batch, seat) => {
    setForm((f) => ({
      ...f,
      seatNumbers: { ...f.seatNumbers, [batch]: seat },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.fullName.trim()) return setError("Full name is required");
    if (!photo) return setError("Please upload or take a photo");
    if (!form.address.trim()) return setError("Address is required");
    if (!form.mobile.trim()) return setError("Mobile number is required");
    if (!/^\d{10}$/.test(form.mobile.trim()))
      return setError("Invalid Mobile number");
    const waNum = wasSame ? form.mobile.trim() : form.whatsappNumber.trim();
    if (!wasSame && !/^\d{10}$/.test(waNum))
      return setError("Invalid WhatsApp number");
    if (form.selectedBatches.length === 0)
      return setError("Please select at least one batch");

    setSubmitting(true);
    try {
      const assignments = form.selectedBatches.map((b) => ({
        batch: b,
        seatNumber: form.seatNumbers[b] || "",
      }));
      const fd = new FormData();
      fd.append("fullName", form.fullName.trim());
      fd.append("mobile", form.mobile.trim());
      fd.append(
        "whatsappNumber",
        (wasSame ? form.mobile : form.whatsappNumber).trim(),
      );
      fd.append("address", form.address.trim());
      fd.append("assignments", JSON.stringify(assignments));
      if (photo) fd.append("photo", photo);

      await axios.post(`${API_BASE}/public/admission`, fd);
      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Submission failed. Please try again.",
      );
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50/40">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="https://wisdom-lib.vercel.app/logo/wisdom-logo.png"
            alt="Wisdom Library"
            className="w-16 h-16 mx-auto mb-3 rounded-2xl shadow-sm object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <h1 className="font-display text-2xl font-bold text-primary">
            Wisdom Library
          </h1>
          <p className="text-primary-lighter text-sm mt-1">
            Self Admission Portal
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl border border-primary-100 p-6 shadow-sm">
            <SuccessScreen
              name={form.fullName}
              mobile={form.mobile}
              batches={form.selectedBatches}
              seatNumbers={form.seatNumbers}
              fee={fee}
            />
          </div>
        ) : (
          <>
            {/* Available seats */}
            <div className="bg-white rounded-2xl border border-primary-100 p-5 mb-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Armchair className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-primary">
                  Available Seats by Shift
                </h2>
              </div>
              {seatsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-primary-50 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <BatchAvailability
                  batches={batches}
                  bookedSeats={bookedSeats}
                />
              )}
            </div>

            {/* Admission form */}
            <div className="bg-white rounded-2xl border border-primary-100 p-5 shadow-sm">
              <h2 className="font-semibold text-primary mb-5">
                Admission Form
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={sf("fullName")}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo <span className="text-red-500">*</span>
                  </label>
                  <PhotoPicker value={photo} onChange={setPhoto} />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      value={form.address}
                      onChange={sf("address")}
                      placeholder="Your full address"
                      rows={2}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={form.mobile}
                      onChange={sf("mobile")}
                      placeholder="10-digit mobile number"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all"
                      required
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    WhatsApp Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={wasSame ? form.mobile : form.whatsappNumber}
                      onChange={sf("whatsappNumber")}
                      disabled={wasSame}
                      placeholder="WhatsApp number"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>
                  <label className="flex items-center gap-2 mt-1.5 cursor-pointer select-none">
                    <div
                      onClick={() => setWasSame((v) => !v)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${wasSame ? "bg-primary border-primary" : "border-gray-300"}`}
                    >
                      {wasSame && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-xs text-gray-500">
                      Same as mobile number
                    </span>
                  </label>
                </div>

                {/* Batch multi-select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shift / Batch <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-1">
                      (select all that apply)
                    </span>
                  </label>
                  <div className="space-y-2">
                    {batches.map((b) => {
                      const checked = form.selectedBatches.includes(b);
                      return (
                        <div
                          key={b}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${checked ? "border-primary bg-primary/5" : "border-gray-200"}`}
                        >
                          {/* Checkbox */}
                          <div
                            onClick={() => toggleBatch(b)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${checked ? "bg-primary border-primary" : "border-gray-300"}`}
                          >
                            {checked && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          {/* Batch name */}
                          <div
                            className="flex items-center gap-1.5 flex-1 cursor-pointer"
                            onClick={() => toggleBatch(b)}
                          >
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-700">{b}</span>
                          </div>
                          {/* Seat dropdown (only when checked) */}
                          {checked && (
                            <select
                              value={form.seatNumbers[b] || ""}
                              onChange={(e) => setSeat(b, e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-primary bg-white appearance-none"
                            >
                              <option value="">Any seat</option>
                              {availableForBatch(b).map((n) => (
                                <option key={n} value={n}>
                                  Seat {n} (
                                  {Number(n) <= 20
                                    ? "Girl / लड़की"
                                    : "Boy / लड़का"}
                                  )
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Fee display */}
                  {form.selectedBatches.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5"
                    >
                      <div>
                        <p className="text-xs text-amber-700">
                          {form.selectedBatches.length} shift
                          {form.selectedBatches.length > 1 ? "s" : ""} selected
                          · Library Fee
                        </p>
                        <p className="text-xs text-amber-600">
                          {form.selectedBatches.length} शिफ्ट चुनी गई ·
                          लाइब्रेरी फीस
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-amber-800">
                          ₹{fee}
                        </p>
                        <p className="text-[10px] text-amber-600">
                          per month / प्रति माह
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-primary/30"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                    </>
                  ) : (
                    "Submit Admission Request"
                  )}
                </button>
              </form>
            </div>
          </>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Wisdom Library · Your seat will be confirmed after admin verification
        </p>
      </div>
    </div>
  );
}
