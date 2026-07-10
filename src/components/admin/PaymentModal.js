'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, IndianRupee, Banknote, CreditCard, CheckCircle, Loader2, CalendarCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { MONTH_NAMES, formatCurrency, photoUrl, blockNumberSpin } from '@/lib/utils';
import { addMonths, addDays, format, differenceInDays } from 'date-fns';

const TODAY = new Date().toISOString().split('T')[0];

/* Given all payments + admission date → return { startYear, startMonth, paidUpToLabel, totalMonthsPaid } */
function resolvePaymentState(allPayments, admissionDate) {
  const base = admissionDate ? new Date(admissionDate) : new Date();
  let maxYear = base.getFullYear();
  let maxMonth = base.getMonth() + 1;
  let totalMonthsPaid = 0;

  for (const p of allPayments) {
    for (const mc of p.monthsCovered || []) {
      totalMonthsPaid++;
      if (mc.year > maxYear || (mc.year === maxYear && mc.month > maxMonth)) {
        maxYear = mc.year;
        maxMonth = mc.month;
      }
    }
  }

  const paidUpToLabel = totalMonthsPaid === 0
    ? 'No payments recorded yet'
    : format(addMonths(base, totalMonthsPaid), 'MMM d, yyyy');

  // next calendar month after last paid (for building covered[] chips)
  const nextMonth = maxMonth === 12 ? 1 : maxMonth + 1;
  const nextYear  = maxMonth === 12 ? maxYear + 1 : maxYear;

  return { startMonth: nextMonth, startYear: nextYear, paidUpToLabel, totalMonthsPaid };
}

/* Build array of month labels covered by [startMonth/startYear] for n months */
function buildCoveredMonths(startYear, startMonth, count) {
  const months = [];
  let y = startYear, m = startMonth;
  for (let i = 0; i < count; i++) {
    months.push({ year: y, month: m, label: `${MONTH_NAMES[m - 1]} ${y}` });
    m++; if (m > 12) { m = 1; y++; }
  }
  return months;
}


export default function PaymentModal({ student, onClose, onSuccess }) {
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [submitting, setSubmitting]           = useState(false);

  // state resolved from payment history
  const [startYear, setStartYear]             = useState(new Date().getFullYear());
  const [startMonth, setStartMonth]           = useState(new Date().getMonth() + 1);
  const [paidUpToLabel, setPaidUpToLabel]     = useState('');
  const [totalMonthsPaid, setTotalMonthsPaid] = useState(0);

  // form fields
  const [amount, setAmount]         = useState('');
  const [numMonths, setNumMonths]   = useState(1);
  const [monthsTouched, setMonthsTouched] = useState(false);
  const [mode, setMode]             = useState('cash');
  const [referenceNo, setRefNo]     = useState('');
  const [receivedDate, setDate]     = useState(TODAY);

  const amountRef = useRef(null);

  // ── Auto-detect next unpaid month ─────────────────────────────
  useEffect(() => {
    if (!student?._id) return;
    setFetchingHistory(true);
    setMonthsTouched(false);
    api.get(`/payments/student/${student._id}`, { params: { page: 1 } })
      .then(({ data }) => {
        const { startYear: sy, startMonth: sm, paidUpToLabel: lbl, totalMonthsPaid: tmp } =
          resolvePaymentState(data.payments || [], student.admissionDate);
        setStartYear(sy);
        setStartMonth(sm);
        setPaidUpToLabel(lbl);
        setTotalMonthsPaid(tmp);
      })
      .catch(() => {})
      .finally(() => {
        setFetchingHistory(false);
        setTimeout(() => amountRef.current?.focus(), 100);
      });
  }, [student]);

  // ── Derived calculations ──────────────────────────────────────
  const fee             = student?.libraryFees || 0;
  const parsedAmt       = parseFloat(amount) || 0;
  // Suggest floor(amount / fee) months (e.g. 700 at a 300 fee -> 2 months).
  // The admin can still adjust manually for bundle/discounted pricing.
  const suggestedMonths = fee > 0 && parsedAmt > 0 ? Math.max(1, Math.floor(parsedAmt / fee)) : 1;

  // Re-suggests whenever the amount changes, even if the admin had manually
  // adjusted months for a previous amount (see handleAmountChange below).
  useEffect(() => {
    if (!monthsTouched) setNumMonths(suggestedMonths);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedMonths, monthsTouched]);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setMonthsTouched(false);
  };

  const covered         = parsedAmt > 0 ? buildCoveredMonths(startYear, startMonth, numMonths) : [];
  const remainder       = fee > 0 ? parsedAmt - fee * numMonths : 0;
  const admBase         = student?.admissionDate ? new Date(student.admissionDate) : new Date();
  const newPaidThrough  = parsedAmt > 0 ? addMonths(admBase, totalMonthsPaid + numMonths) : null;
  const newNextDue      = newPaidThrough ? addDays(newPaidThrough, 1) : null;
  const paidThroughStr  = newPaidThrough ? format(newPaidThrough, 'MMM d, yyyy') : null;
  const dueDateStr      = newNextDue ? format(newNextDue, 'MMMM d, yyyy') : null;

  const adjustMonths = (delta) => {
    setMonthsTouched(true);
    setNumMonths(m => Math.max(1, m + delta));
  };
  const handleMonthsInput = (e) => {
    setMonthsTouched(true);
    setNumMonths(Math.max(1, parseInt(e.target.value) || 1));
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parsedAmt <= 0) return toast.error('Enter a valid amount');
    setSubmitting(true);
    try {
      await api.post('/payments', {
        studentId:    student._id,
        amount:       parsedAmt,
        mode,
        referenceNo:  referenceNo.trim() || undefined,
        receivedDate,
        startYear,
        startMonth,
        numMonths,
      });
      toast.success('Payment recorded!');
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-primary to-primary-light px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              {student?.photo
                ? <img src={photoUrl(student.photo)} alt="" className="w-full h-full object-cover" />
                : <span className="text-white font-bold text-base">{student?.fullName?.charAt(0)?.toUpperCase()}</span>}
            </div>
            <div>
              <p className="text-white font-display font-bold text-sm leading-tight">{student?.fullName}</p>
              {fetchingHistory ? (
                <p className="text-white/55 text-xs">Loading history…</p>
              ) : (() => {
                const admBase2 = student?.admissionDate ? new Date(student.admissionDate) : new Date();
                const nextDue2 = addDays(addMonths(admBase2, totalMonthsPaid), 1);
                const days2    = differenceInDays(nextDue2, new Date());
                const col      = days2 < 0 ? 'text-red-300' : days2 <= 7 ? 'text-orange-300' : 'text-green-300';
                return (
                  <p className={`text-xs font-medium ${col}`}>
                    Paid upto: {paidUpToLabel}
                  </p>
                );
              })()}
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors flex-shrink-0">
            <X size={15} />
          </button>
        </div>

        {fetchingHistory ? (
          <div className="flex items-center justify-center gap-3 py-14 text-primary-lighter text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading payment history…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">

            {/* ── Amount — the only thing admin needs to type ── */}
            <div>
              <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wide">
                Amount Received (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-lighter pointer-events-none" />
                <input
                  ref={amountRef}
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={handleAmountChange}
                  {...blockNumberSpin}
                  placeholder={fee > 0 ? `e.g. ${fee}` : '0'}
                  className="input-field pl-9 text-2xl font-bold tracking-tight"
                  style={{ fontSize: '1.4rem' }}
                />
              </div>
              {fee > 0 && (
                <p className="text-xs text-primary-lighter mt-1.5">
                  Monthly fee: <strong className="text-primary">{formatCurrency(fee)}</strong>
                  {amount && parsedAmt > 0 && (
                    <span className="ml-2 text-primary-lighter">
                      → {formatCurrency(fee)} × {numMonths} = {formatCurrency(fee * numMonths)}
                      {remainder > 0 && <span className="text-orange-500"> (+{formatCurrency(remainder)} extra)</span>}
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* ── Months to cover — editable for bundle/discounted pricing ── */}
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
                    onClick={() => { setMonthsTouched(false); setNumMonths(suggestedMonths); }}
                    className="text-xs text-primary-lighter hover:text-primary underline underline-offset-2"
                  >
                    Reset to {suggestedMonths} (suggested)
                  </button>
                )}
              </div>
              <p className="text-xs text-primary-lighter mt-1.5">
                Adjust manually for bundle/discounted pricing (e.g. ₹500 for 2 months).
              </p>
            </div>

            {/* ── Live preview — shows once amount is entered ── */}
            <AnimatePresence>
              {parsedAmt > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl border-2 border-primary/20 bg-primary-50 divide-y divide-primary-100 overflow-hidden">
                    {/* Months covered */}
                    <div className="px-4 py-3 flex items-start gap-3">
                      <CalendarCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-primary-lighter uppercase tracking-wide mb-1.5">Covers</p>
                        <div className="flex flex-wrap gap-1.5">
                          {covered.map(mc => (
                            <span key={`${mc.year}-${mc.month}`}
                              className="px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-lg">
                              {mc.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Paid up to + Next due */}
                    <div className="px-4 py-3 flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-primary-lighter">Paid upto</span>
                      <span className="font-bold text-primary">{paidThroughStr}</span>
                      <ArrowRight className="w-3 h-3 text-primary-lighter mx-0.5" />
                      <span className="text-primary-lighter text-xs">Next due</span>
                      <span className="font-bold text-primary text-xs">{dueDateStr}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Mode ── */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setMode('cash')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                  mode === 'cash'
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'bg-white border-primary-200 text-primary-lighter hover:border-primary/40'
                }`}>
                <Banknote className="w-4 h-4" /> Cash
                {mode === 'cash' && <CheckCircle className="w-3.5 h-3.5" />}
              </button>
              <button type="button" onClick={() => setMode('online')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                  mode === 'online'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-primary-200 text-primary-lighter hover:border-primary/40'
                }`}>
                <CreditCard className="w-4 h-4" /> Online
                {mode === 'online' && <CheckCircle className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* ── Reference (online only) ── */}
            <AnimatePresence>
              {mode === 'online' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <input
                    value={referenceNo}
                    onChange={e => setRefNo(e.target.value)}
                    placeholder="UPI / Bank reference number"
                    className="input-field text-sm"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Date ── */}
            <input type="date" value={receivedDate} onChange={e => setDate(e.target.value)} className="input-field text-sm" />

            {/* ── Submit ── */}
            <button type="submit" disabled={submitting || parsedAmt <= 0}
              className="w-full btn-primary flex items-center justify-center gap-2 text-base font-bold py-3.5 disabled:opacity-40">
              {submitting
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <CheckCircle className="w-5 h-5" />}
              {submitting ? 'Recording…' : `Record ${parsedAmt > 0 ? formatCurrency(parsedAmt) : ''} Payment`}
            </button>

          </form>
        )}
      </motion.div>
    </div>
  );
}
