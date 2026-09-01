'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, IndianRupee, Banknote, CreditCard, CheckCircle, Loader2, CalendarCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatCurrency, SHIFT_FEES, photoUrl, blockNumberSpin, computeStudentPaidThrough, generateMonthOptions, toLocalDateStr } from '@/lib/utils';
import StudentAvatar from '@/components/StudentAvatar';
import { addMonths, addDays, format, differenceInDays, differenceInCalendarDays } from 'date-fns';

const TODAY = new Date().toISOString().split('T')[0];

export default function PaymentModal({ student, onClose, onSuccess }) {
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [submitting, setSubmitting]           = useState(false);

  // state resolved from payment history
  const [currentPaidThrough, setCurrentPaidThrough] = useState(new Date());
  const [paidUpToLabel, setPaidUpToLabel]     = useState('');

  // form fields
  const [amount, setAmount]         = useState('');
  const [numMonths, setNumMonths]   = useState(1);
  const [monthsTouched, setMonthsTouched] = useState(false);
  const [noMonthCoverage, setNoMonthCoverage] = useState(false);
  const [coversUntil, setCoversUntil] = useState('');
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [mode, setMode]             = useState('cash');
  const [referenceNo, setRefNo]     = useState('');
  const [receivedDate, setDate]     = useState(TODAY);
  const [updateFee, setUpdateFee]   = useState(false);

  const amountRef = useRef(null);

  // ── Auto-detect current paid-through date from history ─────────
  useEffect(() => {
    if (!student?._id) return;
    setFetchingHistory(true);
    setMonthsTouched(false);
    api.get(`/payments/student/${student._id}`, { params: { page: 1 } })
      .then(({ data }) => {
        const payments = data.payments || [];
        const paidThrough = computeStudentPaidThrough(student.admissionDate, payments);
        setCurrentPaidThrough(paidThrough);
        setPaidUpToLabel(payments.length === 0 ? 'No payments recorded yet' : format(paidThrough, 'MMM d, yyyy'));
      })
      .catch(() => {})
      .finally(() => {
        setFetchingHistory(false);
        setTimeout(() => amountRef.current?.focus(), 100);
      });
  }, [student]);

  // ── Default "Covers Until" — resets to admin's chosen months whenever
  // numMonths (or the base paid-through date) changes, discarding any
  // manual override. The admin can then edit the date field for a custom
  // partial period (e.g. 15 days); editing months again resets it back.
  useEffect(() => {
    if (fetchingHistory) return;
    setCoversUntil(toLocalDateStr(addMonths(currentPaidThrough, numMonths)));
    setIsCustomDate(false);
  }, [numMonths, currentPaidThrough, fetchingHistory]);

  const handleCoversUntilChange = (e) => {
    setCoversUntil(e.target.value);
    setIsCustomDate(true);
  };

  // ── Derived calculations ──────────────────────────────────────
  const shiftCount      = student?.seatAssignments?.length || 1;
  const standardFee     = SHIFT_FEES[shiftCount] || 0;
  const savedFee        = student?.libraryFees || 0;
  // Use shift-based standard as the effective rate; fall back to saved fee.
  // This keeps month math correct even when libraryFees is stale after a shift change.
  const fee             = standardFee || savedFee;
  const feeIsStale      = standardFee > 0 && savedFee !== standardFee;
  const parsedAmt       = parseFloat(amount) || 0;
  const suggestedMonths = fee > 0 && parsedAmt > 0 ? Math.max(1, Math.floor(parsedAmt / fee)) : 1;
  const remainder       = fee > 0 ? parsedAmt - fee * numMonths : 0;

  // Auto-check "update fee" whenever the saved fee is stale vs current shifts.
  useEffect(() => {
    setUpdateFee(feeIsStale);
  }, [feeIsStale]);

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

  const periodStart      = addDays(currentPaidThrough, 1);
  const covered          = parsedAmt > 0 && !noMonthCoverage && !isCustomDate
    ? generateMonthOptions(periodStart.getFullYear(), periodStart.getMonth() + 1, numMonths)
    : [];
  const parsedCoversUntil = parsedAmt > 0 && !noMonthCoverage && coversUntil ? new Date(coversUntil) : null;
  const newNextDue        = parsedCoversUntil ? addDays(parsedCoversUntil, 1) : null;
  const paidThroughStr    = parsedCoversUntil ? format(parsedCoversUntil, 'MMM d, yyyy') : null;
  const dueDateStr        = newNextDue ? format(newNextDue, 'MMMM d, yyyy') : null;
  const coverageDays      = parsedCoversUntil ? differenceInCalendarDays(parsedCoversUntil, currentPaidThrough) : 0;

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
        studentId:   student._id,
        amount:      parsedAmt,
        mode,
        referenceNo: referenceNo.trim() || undefined,
        receivedDate,
        ...(!noMonthCoverage && (isCustomDate
          ? { isCustomDate: true, coversUntil }
          : { startYear: periodStart.getFullYear(), startMonth: periodStart.getMonth() + 1, numMonths })),
      });
      if (updateFee && standardFee > 0) {
        await api.put(`/students/${student._id}`, { libraryFees: standardFee });
      }
      toast.success('Payment recorded!');
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
      <div className="min-h-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="bg-white rounded-3xl w-full max-w-sm min-w-0 shadow-2xl overflow-hidden my-8"
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-primary to-primary-light px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              <StudentAvatar
                src={photoUrl(student?.photo)}
                imgClassName="w-full h-full object-cover"
                fallback={<span className="text-white font-bold text-base">{student?.fullName?.charAt(0)?.toUpperCase()}</span>}
              />
            </div>
            <div>
              <p className="text-white font-display font-bold text-sm leading-tight">{student?.fullName}</p>
              {fetchingHistory ? (
                <p className="text-white/55 text-xs">Loading history…</p>
              ) : (() => {
                const days2 = differenceInDays(addDays(currentPaidThrough, 1), new Date());
                const col   = days2 < 0 ? 'text-red-300' : days2 <= 7 ? 'text-orange-300' : 'text-green-300';
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
              {/* Shift-based fee hint */}
              <div className="mt-1.5 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs bg-primary-50 border border-primary-100 text-primary font-semibold px-2 py-0.5 rounded-full">
                    {shiftCount} shift{shiftCount !== 1 ? 's' : ''} · {formatCurrency(fee)}/mo
                  </span>
                  {fee > 0 && (
                    <button type="button"
                      onClick={() => { setAmount(String(fee)); setMonthsTouched(false); }}
                      className="text-xs text-primary underline underline-offset-2 hover:text-primary-dark">
                      Fill ₹{fee}
                    </button>
                  )}
                </div>
                {fee > 0 && parsedAmt > 0 && (
                  <p className="text-xs text-primary-lighter">
                    {formatCurrency(fee)} × {numMonths} = {formatCurrency(fee * numMonths)}
                    {remainder > 0 && <span className="text-orange-500"> (+{formatCurrency(remainder)} extra)</span>}
                  </p>
                )}
                {feeIsStale && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={updateFee} onChange={e => setUpdateFee(e.target.checked)}
                      className="w-3.5 h-3.5 accent-primary" />
                    <span className="text-xs text-orange-600">
                      Saved fee is <strong>{formatCurrency(savedFee)}</strong> — update to <strong>{formatCurrency(standardFee)}</strong> for {shiftCount} shift{shiftCount !== 1 ? 's' : ''}
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* ── Months to cover — editable for bundle/discounted pricing ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-primary uppercase tracking-wide">
                  Months to Cover
                </label>
                <button
                  type="button"
                  onClick={() => setNoMonthCoverage(v => !v)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    noMonthCoverage
                      ? 'bg-orange-50 border-orange-300 text-orange-600'
                      : 'bg-primary-50 border-primary-200 text-primary-lighter hover:text-primary'
                  }`}
                >
                  {noMonthCoverage ? '✕ No month coverage' : 'Skip month coverage'}
                </button>
              </div>

              {noMonthCoverage ? (
                <p className="text-xs text-orange-500 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
                  Payment will be recorded without covering any month.
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => adjustMonths(-1)}
                      disabled={numMonths <= 1}
                      className="w-10 h-10 rounded-xl border border-primary-200 text-primary font-bold text-lg hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={numMonths}
                      onChange={handleMonthsInput}
                      {...blockNumberSpin}
                      className="input-field w-16 text-center font-bold flex-shrink-0"
                    />
                    <button
                      type="button"
                      onClick={() => adjustMonths(1)}
                      className="w-10 h-10 rounded-xl border border-primary-200 text-primary font-bold text-lg hover:bg-primary-50 transition-colors flex-shrink-0"
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

                  {/* ── Covers Until — auto-set from months above, editable for partial periods ── */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-primary uppercase tracking-wide">
                        Covers Until
                      </label>
                      {isCustomDate && (
                        <button
                          type="button"
                          onClick={() => {
                            setCoversUntil(toLocalDateStr(addMonths(currentPaidThrough, numMonths)));
                            setIsCustomDate(false);
                          }}
                          className="text-xs text-primary-lighter hover:text-primary underline underline-offset-2"
                        >
                          Reset to {numMonths} month{numMonths !== 1 ? 's' : ''}
                        </button>
                      )}
                    </div>
                    <input
                      type="date"
                      value={coversUntil}
                      min={toLocalDateStr(periodStart)}
                      onChange={handleCoversUntilChange}
                      className="input-field text-sm"
                    />
                    {isCustomDate && (
                      <p className="text-xs text-orange-500 mt-1.5">
                        Custom period — {coverageDays} day{coverageDays !== 1 ? 's' : ''} (not a full month)
                      </p>
                    )}
                  </div>
                </>
              )}
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
                    {/* Coverage */}
                    <div className="px-4 py-3 flex items-start gap-3">
                      <CalendarCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-primary-lighter uppercase tracking-wide mb-1.5">Covers</p>
                        {isCustomDate ? (
                          <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-semibold rounded-lg">
                            {coverageDays} day{coverageDays !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {covered.map(mc => (
                              <span key={`${mc.year}-${mc.month}`}
                                className="px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-lg">
                                {mc.label}
                              </span>
                            ))}
                          </div>
                        )}
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
    </div>
  );
}
