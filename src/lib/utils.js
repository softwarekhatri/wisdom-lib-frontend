import {
  format,
  formatDistance,
  differenceInDays,
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

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

// admissionDate: ISO string or Date. totalMonthsPaid: count of all monthsCovered entries.
// Due date = admissionDate + totalMonthsPaid months + 1 day
// e.g. admitted May 12, paid 1 month → paid through Jun 12 → due Jun 13
export const getPaymentStatus = (admissionDate, totalMonthsPaid) => {
  const now = new Date();
  const base = admissionDate ? new Date(admissionDate) : now;
  const paidThroughDate = addMonths(base, totalMonthsPaid);
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

// Standard monthly fees by number of shifts. Index = shift count.
// Used across admission, edit, and payment forms to auto-suggest fees.
export const SHIFT_FEES = { 1: 300, 2: 500, 3: 750, 4: 1000 };

// Keep in sync with backend/src/utils/batches.js — add more here to extend.
export const BATCHES = [
  "6 AM - 10 AM",
  "10 AM - 2 PM",
  "2 PM - 6 PM",
  "6 PM - 10 PM",
];

// Attach to number inputs to stop mouse-wheel scroll and Up/Down arrow keys
// from silently changing the value — easy to trigger by accident.
export const blockNumberSpin = {
  onWheel: (e) => e.target.blur(),
  onKeyDown: (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
  },
};
