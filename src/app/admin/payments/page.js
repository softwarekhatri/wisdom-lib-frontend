'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, IndianRupee, Download, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate, formatCurrency, formatCoverageLabel, photoUrl, toLocalDateStr } from '@/lib/utils';
import StudentAvatar from '@/components/StudentAvatar';

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: '7 Days', days: 7 },
  { label: '1 Month', days: 30 },
  { label: 'Custom', days: -1 },
];

function getDateRange(days) {
  const end = new Date();
  const start = new Date();
  if (days === 0) {
    start.setHours(0, 0, 0, 0);
  } else if (days > 0) {
    start.setDate(start.getDate() - days);
  }
  return {
    startDate: toLocalDateStr(start),
    endDate: toLocalDateStr(end),
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState(2);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [mode, setMode] = useState('all');

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      let dateRange;
      if (preset === 3) {
        dateRange = { startDate: customStart, endDate: customEnd };
      } else {
        dateRange = getDateRange(PRESETS[preset].days);
      }
      const { data } = await api.get('/payments', {
        params: { page, ...dateRange, ...(mode !== 'all' && { mode }) },
      });
      setPayments(data.payments);
      setPagination(data.pagination);
      setTotalAmount(data.totalAmount || 0);
    } catch { toast.error('Failed to load payments'); }
    setLoading(false);
  }, [page, preset, customStart, customEnd, mode]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Payments</h1>
          <p className="text-primary-lighter mt-1">All payment records</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-display font-bold text-primary">{formatCurrency(totalAmount)}</div>
          <div className="text-xs text-primary-lighter">Total in selected range</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-primary-100 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-primary-lighter" />
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => { setPreset(i); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              preset === i ? 'bg-primary text-white shadow-sm' : 'bg-primary-50 text-primary hover:bg-primary-100'
            }`}
          >
            {p.label}
          </button>
        ))}

        {preset === 3 && (
          <>
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="input-field w-auto text-sm py-2"
            />
            <span className="text-primary-lighter text-sm">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="input-field w-auto text-sm py-2"
            />
          </>
        )}

        <div className="h-5 w-px bg-primary-100 mx-1" />

        {[
          { value: 'all', label: 'All' },
          { value: 'cash', label: '💵 Cash' },
          { value: 'online', label: '🌐 Online' },
        ].map(m => (
          <button
            key={m.value}
            onClick={() => { setMode(m.value); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === m.value
                ? m.value === 'cash'
                  ? 'bg-green-600 text-white shadow-sm'
                  : m.value === 'online'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-primary text-white shadow-sm'
                : 'bg-primary-50 text-primary hover:bg-primary-100'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-primary-50 rounded-xl animate-pulse" />)}
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center text-primary-lighter">No payments found for this period</div>
        ) : (
          <div className="table-responsive">
            <table className="w-full">
              <thead>
                <tr className="bg-primary-50 border-b border-primary-100">
                  {['Student', 'Amount', 'Mode', 'Date', 'Covers', 'Recorded By'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-primary-lighter uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {payments.map((p, i) => (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-primary-50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
                          <StudentAvatar
                            src={photoUrl(p.student?.photo)}
                            imgClassName="w-full h-full object-cover"
                            fallback={<span>{p.student?.fullName?.charAt(0)}</span>}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary">{p.student?.fullName || '—'}</p>
                          <p className="text-xs text-primary-lighter">{p.student?.mobile || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-primary">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.mode === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {p.mode}
                      </span>
                      {p.referenceNo && <p className="text-xs text-primary-lighter mt-0.5">{p.referenceNo}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-primary">{formatDate(p.receivedDate)}</td>
                    <td className="px-5 py-3.5 text-xs text-primary-lighter max-w-[160px]">
                      {formatCoverageLabel(p) || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-primary-lighter">{p.createdBy?.fullName || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-primary-50">
            <span className="text-xs text-primary-lighter">{pagination.total} total records</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg border border-primary-200 flex items-center justify-center disabled:opacity-40 hover:bg-primary-50">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-primary-lighter">{page} / {pagination.pages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="w-8 h-8 rounded-lg border border-primary-200 flex items-center justify-center disabled:opacity-40 hover:bg-primary-50">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
