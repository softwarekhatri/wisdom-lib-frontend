'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Users, IndianRupee, Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate, formatCurrency, MONTH_NAMES, photoUrl, toLocalDateStr } from '@/lib/utils';
import StudentAvatar from '@/components/StudentAvatar';

const CHART_COLORS = { primary: '#43332c', gold: '#c9a15e', light: '#9a7b6e', green: '#16a34a', red: '#dc2626' };

const TABS = [
  { id: 'payment', label: '💰 Payment Report' },
  { id: 'dues', label: '⚠️ Dues Report' },
  { id: 'comparison', label: '📊 Comparison' },
];

const PRESETS = [
  { label: 'Today', value: 'today' },
  { label: '1 Week', value: 'week' },
  { label: '1 Month', value: 'month' },
  { label: '3 Months', value: '3months' },
  { label: 'Custom', value: 'custom' },
];

function getDateRange(preset) {
  const now = new Date();
  const end = toLocalDateStr(now);
  let start;
  if (preset === 'today') start = end;
  else if (preset === 'week') { const d = new Date(now); d.setDate(d.getDate() - 7); start = toLocalDateStr(d); }
  else if (preset === 'month') { const d = new Date(now); d.setDate(d.getDate() - 30); start = toLocalDateStr(d); }
  else if (preset === '3months') { const d = new Date(now); d.setDate(d.getDate() - 90); start = toLocalDateStr(d); }
  else start = end;
  return { startDate: start, endDate: end };
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-primary text-white px-3 py-2 rounded-xl shadow-lg text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name}>{p.name}: {typeof p.value === 'number' ? formatCurrency(p.value) : p.value}</p>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('payment');
  const [chartType, setChartType] = useState('area');
  const [preset, setPreset] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [paymentData, setPaymentData] = useState(null);
  const [duesData, setDuesData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [duesPage, setDuesPage] = useState(1);
  const [duesPagination, setDuesPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPaymentReport = async () => {
    setLoading(true);
    try {
      const dates = preset === 'custom' ? { startDate: customStart, endDate: customEnd } : getDateRange(preset);
      const { data } = await api.get('/reports/payments', { params: dates });
      setPaymentData(data);
    } catch { toast.error('Failed to load payment report'); }
    setLoading(false);
  };

  const fetchDues = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports/dues', { params: { page: duesPage } });
      setDuesData(data.students);
      setDuesPagination(data.pagination);
    } catch { toast.error('Failed to load dues'); }
    setLoading(false);
  };

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports/comparison');
      setComparisonData(data);
    } catch { toast.error('Failed to load comparison'); }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'payment') fetchPaymentReport();
    else if (activeTab === 'dues') fetchDues();
    else if (activeTab === 'comparison') fetchComparison();
  }, [activeTab, preset, customStart, customEnd, duesPage]);

  const renderPaymentChart = () => {
    if (!paymentData?.chartData?.length) return <div className="py-12 text-center text-primary-lighter text-sm">No data for this period</div>;
    const data = paymentData.chartData;

    const commonProps = {
      data, margin: { top: 10, right: 20, left: 10, bottom: 5 }
    };

    return (
      <ResponsiveContainer width="100%" height={320}>
        {chartType === 'area' ? (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5e8e0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: CHART_COLORS.light }} />
            <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.light }} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="total" name="Total" stroke={CHART_COLORS.primary} fill="url(#colorTotal)" strokeWidth={2} />
          </AreaChart>
        ) : chartType === 'bar' ? (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5e8e0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: CHART_COLORS.light }} />
            <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.light }} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="cash" name="Cash" fill={CHART_COLORS.primary} radius={[4,4,0,0]} />
            <Bar dataKey="online" name="Online" fill={CHART_COLORS.gold} radius={[4,4,0,0]} />
          </BarChart>
        ) : (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5e8e0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: CHART_COLORS.light }} />
            <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.light }} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="total" name="Total" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={{ fill: CHART_COLORS.primary, r: 4 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Reports</h1>
        <p className="text-primary-lighter mt-1">Analytics and insights</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === t.id ? 'bg-primary text-white shadow-sm' : 'bg-white text-primary border border-primary-100 hover:bg-primary-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Payment Report */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-primary-100 p-4 flex flex-wrap gap-3 items-center">
            {PRESETS.map(p => (
              <button key={p.value} onClick={() => setPreset(p.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${preset === p.value ? 'bg-primary text-white' : 'bg-primary-50 text-primary hover:bg-primary-100'}`}>
                {p.label}
              </button>
            ))}
            {preset === 'custom' && (
              <>
                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="input-field w-auto text-sm py-2" />
                <span className="text-primary-lighter text-sm">to</span>
                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="input-field w-auto text-sm py-2" />
              </>
            )}
          </div>

          {/* Summary cards */}
          {paymentData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Collected', value: formatCurrency(paymentData.summary.totalAmount), color: 'bg-primary' },
                { label: 'Cash', value: formatCurrency(paymentData.summary.cashTotal), color: 'bg-green-600' },
                { label: 'Online', value: formatCurrency(paymentData.summary.onlineTotal), color: 'bg-blue-600' },
                { label: 'Transactions', value: paymentData.summary.count, color: 'bg-gold-dark' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-primary-100 p-4">
                  <div className="text-xs text-primary-lighter mb-1">{s.label}</div>
                  <div className={`text-xl font-display font-bold text-primary`}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-primary-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-primary">Collection Trend</h2>
              <div className="flex gap-2">
                {['area', 'bar', 'line'].map(t => (
                  <button key={t} onClick={() => setChartType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${chartType === t ? 'bg-primary text-white' : 'bg-primary-50 text-primary'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {loading ? <div className="h-72 bg-primary-50 rounded-xl animate-pulse" /> : renderPaymentChart()}
          </div>
        </div>
      )}

      {/* Dues Report */}
      {activeTab === 'dues' && (
        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
            Students shown here have payments overdue or due within 7 days.
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => <div key={i} className="h-36 bg-white rounded-2xl border border-primary-100 animate-pulse" />)}
            </div>
          ) : !duesData?.length ? (
            <div className="bg-white rounded-2xl border border-primary-100 py-16 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="font-semibold text-primary">All Clear!</h3>
              <p className="text-primary-lighter text-sm mt-1">No students with pending dues</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {duesData.map((s, i) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-2xl border overflow-hidden ${s.hasDues ? 'border-red-200' : 'border-orange-200'}`}
                >
                  <div className={`h-2 w-full ${s.hasDues ? 'bg-red-500' : 'bg-orange-400'}`} />
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
                        <p className="font-semibold text-primary text-sm">{s.fullName}</p>
                        <p className="text-xs text-primary-lighter">{s.mobile || '—'}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-primary-lighter">
                      <div>Last payment: <span className="text-primary font-medium">{s.lastPaymentDate ? formatDate(s.lastPaymentDate) : 'None'}</span></div>
                      <div>Paid upto: <span className={`font-medium ${s.hasDues ? 'text-red-600' : s.dueSoon ? 'text-orange-500' : 'text-green-600'}`}>{s.paidThroughDate ? formatDate(s.paidThroughDate, 'dd MMM yyyy') : '—'}</span></div>
                    </div>
                    <div className={`mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg text-center ${s.hasDues ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {s.hasDues ? '⚠️ Overdue' : `⏰ Due in ${s.daysUntilDue} day${s.daysUntilDue !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {duesPagination && duesPagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setDuesPage(p => Math.max(1, p - 1))} disabled={duesPage === 1} className="w-9 h-9 rounded-xl border border-primary-200 flex items-center justify-center disabled:opacity-40 hover:bg-primary-50">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-primary-lighter">Page {duesPage} of {duesPagination.pages}</span>
              <button onClick={() => setDuesPage(p => Math.min(duesPagination.pages, p + 1))} disabled={duesPage === duesPagination.pages} className="w-9 h-9 rounded-xl border border-primary-200 flex items-center justify-center disabled:opacity-40 hover:bg-primary-50">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Comparison Report */}
      {activeTab === 'comparison' && comparisonData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-primary-100 p-5 text-center">
              <div className="text-xs text-primary-lighter mb-2 uppercase tracking-wide">{comparisonData.previous?.label}</div>
              <div className="text-3xl font-display font-bold text-primary-lighter">{formatCurrency(comparisonData.previous?.total)}</div>
              <div className="text-xs text-primary-lighter mt-1">{comparisonData.previous?.count} transactions</div>
            </div>
            <div className={`rounded-2xl p-5 text-center ${comparisonData.delta >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="text-xs text-primary-lighter mb-2 uppercase tracking-wide">Delta</div>
              <div className={`text-3xl font-display font-bold flex items-center justify-center gap-1 ${comparisonData.delta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {comparisonData.delta >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                {formatCurrency(Math.abs(comparisonData.delta))}
              </div>
              <div className={`text-sm font-semibold mt-1 ${comparisonData.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {comparisonData.deltaPercent > 0 ? '+' : ''}{comparisonData.deltaPercent}%
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-primary-100 p-5 text-center">
              <div className="text-xs text-primary-lighter mb-2 uppercase tracking-wide">{comparisonData.current?.label}</div>
              <div className="text-3xl font-display font-bold text-primary">{formatCurrency(comparisonData.current?.total)}</div>
              <div className="text-xs text-primary-lighter mt-1">{comparisonData.current?.count} transactions</div>
            </div>
          </div>

          {/* Bar chart comparison */}
          <div className="bg-white rounded-2xl border border-primary-100 p-5">
            <h2 className="font-semibold text-primary mb-5">Period Comparison</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[
                { period: comparisonData.previous?.label, amount: comparisonData.previous?.total },
                { period: comparisonData.current?.label, amount: comparisonData.current?.total },
              ]} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5e8e0" />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: CHART_COLORS.light }} />
                <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.light }} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" name="Amount" radius={[8,8,0,0]}>
                  <Cell fill={CHART_COLORS.light} />
                  <Cell fill={CHART_COLORS.primary} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
