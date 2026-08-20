import {
  format,
  formatDistance,
  differenceInDays,
  differenceInCalendarDays,
  addMonths,
  addDays,
} from "date-fns";

// Returns YYYY-MM-DD in LOCAL time — avoids UTC offset shifting the date (e.g. IST midnight = prev day in UTC)
export const toLocalDateStr = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const formatDate = (date, fmt = "dd MMM yyyy") => {
  if (!date) return "—";
  return format(new Date(date), fmt);
};

export const formatDateTime = (date, fmt = "dd MMM yyyy, hh:mm a") => {
  if (!date) return "—";
  return format(new Date(date), fmt);
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

// Mirrors backend/src/utils/paymentDates.js computePaidThroughDate — single
// source of truth for "how far is this student paid up to" on the client.
// New-style payments (isCustomDate or whole-month, recorded after the
// covers-until feature shipped) store an explicit coversUntil date that
// already bakes in every prior month/override, so the latest one wins.
// Students with only legacy (monthsCovered-only) payments fall back to the
// old whole-months-from-admission-date formula.
export const computeStudentPaidThrough = (admissionDate, payments) => {
  const base = admissionDate ? new Date(admissionDate) : new Date();
  const withCoversUntil = (payments || []).filter((p) => p.coversUntil);
  if (withCoversUntil.length) {
    return withCoversUntil.reduce(
      (latest, p) => (new Date(p.coversUntil) > latest ? new Date(p.coversUntil) : latest),
      new Date(withCoversUntil[0].coversUntil),
    );
  }
  const totalMonths = (payments || []).reduce((sum, p) => sum + (p.monthsCovered?.length || 0), 0);
  return addMonths(base, totalMonths);
};

// admissionDate: ISO string or Date. payments: the student's Payment docs.
// Due date = paid-through date + 1 day
// e.g. admitted May 12, paid 1 month → paid through Jun 12 → due Jun 13
export const getPaymentStatus = (admissionDate, payments) => {
  const now = new Date();
  const paidThroughDate = computeStudentPaidThrough(admissionDate, payments);
  const dueDate = addDays(paidThroughDate, 1);
  const daysUntilDue = differenceInDays(dueDate, now);
  const dueDateLabel = format(dueDate, "MMMM d, yyyy");
  const paidThroughLabel = format(paidThroughDate, "MMMM d, yyyy");

  if (daysUntilDue < 0) {
    return {
      status: "due",
      label: "Payment Overdue",
      color: "red",
      daysUntilDue,
      dueDate,
      dueDateLabel,
      paidThroughLabel,
    };
  }
  if (daysUntilDue <= 5) {
    return {
      status: "due-soon",
      label: `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`,
      color: "orange",
      daysUntilDue,
      dueDate,
      dueDateLabel,
      paidThroughLabel,
    };
  }
  return {
    status: "paid",
    label: `Paid upto ${paidThroughLabel}`,
    color: "green",
    daysUntilDue,
    dueDate,
    dueDateLabel,
    paidThroughLabel,
  };
};

export const getMembershipDuration = (admissionDate) => {
  if (!admissionDate) return null;
  const joined = new Date(admissionDate);
  const now = new Date();
  const years = now.getFullYear() - joined.getFullYear();
  const months = now.getMonth() - joined.getMonth();
  const totalMonths = years * 12 + months;
  return { years, months: totalMonths % 12, totalMonths };
};

export const isAnniversaryWindow = (admissionDate) => {
  if (!admissionDate) return { isAnniversary: false, yearsCompleted: 0 };
  const joined = new Date(admissionDate);
  const now = new Date();
  const yearsCompleted = now.getFullYear() - joined.getFullYear();
  if (yearsCompleted < 1) return { isAnniversary: false, yearsCompleted: 0 };

  const anniversaryDate = new Date(joined);
  anniversaryDate.setFullYear(now.getFullYear());
  const windowEnd = new Date(anniversaryDate);
  windowEnd.setDate(windowEnd.getDate() + 10);

  const isAnniversary = now >= anniversaryDate && now <= windowEnd;
  return { isAnniversary, yearsCompleted };
};

// Renders a payment's coverage for history displays: whole-month payments
// show month chips' text ("Aug 2026, Sep 2026"); custom/overridden partial
// periods (no monthsCovered, but a coversUntil/periodStart pair) show a day
// count ("15 days") instead. Returns null if the payment covers no period.
export const formatCoverageLabel = (payment) => {
  if (payment?.monthsCovered?.length > 0) {
    return payment.monthsCovered
      .map((mc) => `${MONTH_NAMES[mc.month - 1].slice(0, 3)} ${mc.year}`)
      .join(", ");
  }
  if (payment?.coversUntil && payment?.periodStart) {
    const days = differenceInCalendarDays(new Date(payment.coversUntil), new Date(payment.periodStart)) + 1;
    return `${days} day${days !== 1 ? "s" : ""}`;
  }
  return null;
};

export const generateMonthOptions = (startYear, startMonth, count = 12) => {
  const options = [];
  let y = startYear;
  let m = startMonth;
  for (let i = 0; i < count; i++) {
    options.push({ year: y, month: m, label: `${MONTH_NAMES[m - 1]} ${y}` });
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return options;
};

export const getAdmissionWhatsAppUrl = (student) => {
  const rawPhone = student.whatsappNumber || student.mobile;
  if (!rawPhone) return null;
  let num = rawPhone.replace(/\D/g, "");
  if (num.length === 10) num = "91" + num;
  else if (num.startsWith("0") && num.length === 11) num = "91" + num.slice(1);

  const studentId = student.mobile || student.username || student._id;

  const msg =
    `Hi ${student.fullName}!\n\n` +
    `Welcome to *Wisdom Library*!\n\n` +
    `Your admission is successful. We're excited to have you with us!\n\n` +
    `*Your Login Details:*\n` +
    `*Student ID / Username:* ${studentId}\n` +
    `*Password:* 123456\n\n` +
    `You can login to our website to view your details and change your password:\n` +
    `*https://wisdom-lib.vercel.app*\n\n` +
    `Thank you for joining us!\n` +
    `*Wisdom Library*`;

  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
};

export const getWhatsAppUrl = (student, nextDueDate, libraryFees) => {
  const rawPhone = student.whatsappNumber || student.mobile;
  if (!rawPhone) return null;
  let num = rawPhone.replace(/\D/g, "");
  if (num.length === 10) num = "91" + num;
  else if (num.startsWith("0") && num.length === 11) num = "91" + num.slice(1);

  const dueDateStr = nextDueDate
    ? new Date(nextDueDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "soon";
  const fee = libraryFees || student.libraryFees || 0;

  const msg =
    `Hi ${student.fullName}!\n\n` +
    `This is a reminder from *Wisdom Library*\n\n` +
    `Your library membership fee is due.\n\n` +
    `*Amount:* ₹${fee}/month\n` +
    `*Due Date:* ${dueDateStr}\n\n` +
    `Please visit the library to clear your dues.\n\n` +
    `Thank you!\n` +
    `*Wisdom Library*`;

  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
};

export const getPaymentRecordedWhatsAppUrl = (payment) => {
  const student = payment.student || {};
  const rawPhone = student.whatsappNumber || student.mobile;
  if (!rawPhone) return null;
  let num = rawPhone.replace(/\D/g, "");
  if (num.length === 10) num = "91" + num;
  else if (num.startsWith("0") && num.length === 11) num = "91" + num.slice(1);

  const dateStr = payment.receivedDate
    ? new Date(payment.receivedDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "today";
  const modeLabel = payment.mode === "online" ? "Online" : "Cash";

  const msg =
    `Hi ${student.fullName || "there"}!\n\n` +
    `Your payment has been recorded at *Wisdom Library*.\n\n` +
    `*Amount Paid:* ₹${payment.amount}\n` +
    `*Payment Mode:* ${modeLabel}\n` +
    `*Date:* ${dateStr}\n\n` +
    `Thank you for your payment!\n` +
    `*Wisdom Library*`;

  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
};

export const clsx = (...classes) => classes.filter(Boolean).join(" ");

export const apiBase =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
  "https://wisdom-library-backend.vercel.app";

export const photoUrl = (photo) => {
  if (!photo) return "";
  return /^https?:\/\//i.test(photo) ? photo : `${apiBase}${photo}`;
};

// Standard monthly fees by number of day-shifts (fixed seat).
export const SHIFT_FEES = { 1: 300, 2: 500, 3: 750, 4: 1000 };

// Flexi batch fees (no fixed seat) — 1 shift ₹200, 2 shifts ₹400, 3+ shifts ₹600.
export const FLEXI_FEES = { 1: 200, 2: 400, 3: 600 };

// Returns the flexi fee for a given number of shifts (capped at 3).
export const computeFlexiFee = (count) => FLEXI_FEES[Math.min(count, 3)] || 0;

// Night shift is a special batch priced independently at a flat rate.
export const NIGHT_SHIFT = "10 PM - 6 AM";
export const NIGHT_SHIFT_FEE = 400;

// Keep in sync with backend/src/utils/batches.js — add more here to extend.
export const BATCHES = [
  "6 AM - 10 AM",
  "10 AM - 2 PM",
  "2 PM - 6 PM",
  "6 PM - 10 PM",
  NIGHT_SHIFT,
];

// Compute the standard fee for an array of batch strings.
// Night shift contributes a flat 400; day shifts use SHIFT_FEES by count.
export const computeStandardFee = (batches = []) => {
  const hasNight = batches.includes(NIGHT_SHIFT);
  const dayCount = batches.filter((b) => b !== NIGHT_SHIFT).length;
  return (hasNight ? NIGHT_SHIFT_FEE : 0) + (SHIFT_FEES[dayCount] || 0);
};

// Attach to number inputs to stop mouse-wheel scroll and Up/Down arrow keys
// from silently changing the value — easy to trigger by accident.
export const blockNumberSpin = {
  onWheel: (e) => e.target.blur(),
  onKeyDown: (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
  },
};
