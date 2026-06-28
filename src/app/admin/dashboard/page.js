'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Users, CreditCard, AlertTriangle, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate, apiBase, getWhatsAppUrl } from '@/lib/utils';

const WhatsAppIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);
import PaymentModal from '@/components/admin/PaymentModal';

function StatCard({ title, value, icon: Icon, color, href, loading }) {
  return (
    <Link href={href || '#'}>
      <motion.div
        whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(67,51,44,0.15)' }}
        className="bg-white rounded-2xl p-6 border border-primary-100 cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-lighter text-sm font-medium">{title}</p>
            {loading ? (
              <div className="h-8 w-20 bg-primary-100 rounded animate-pulse mt-2" />
            ) : (
              <p className="text-3xl font-display font-bold text-primary mt-1">{value}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 text-primary-lighter text-xs">
          <ChevronRight className="w-3 h-3" />
          View details
        </div>
      </motion.div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [dueSoon, setDueSoon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payStudent, setPayStudent] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [studentsRes, paymentsRes, duesRes] = await Promise.all([
          api.get('/students?page=1'),
          api.get('/payments?page=1'),
          api.get('/reports/dues?page=1'),
        ]);
        setStats({
          totalStudents: studentsRes.data.pagination.total,
          monthPayments: paymentsRes.data.totalAmount || 0,
          studentsWithDues: duesRes.data.pagination.total,
        });
        setRecentPayments(paymentsRes.data.payments.slice(0, 5));
        setDueSoon(duesRes.data.students.slice(0, 4));
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Dashboard</h1>
        <p className="text-primary-lighter mt-1">Wisdom Library admin overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard
          title="Total Active Students"
          value={stats?.totalStudents ?? '—'}
          icon={Users}
          color="bg-primary"
          href="/admin/students"
          loading={loading}
        />
        <StatCard
          title="This Month's Collection"
          value={stats ? formatCurrency(stats.monthPayments) : '—'}
          icon={CreditCard}
          color="bg-gold-dark"
          href="/admin/payments"
          loading={loading}
        />
        <StatCard
          title="Students with Dues"
          value={stats?.studentsWithDues ?? '—'}
          icon={AlertTriangle}
          color="bg-red-500"
          href="/admin/reports"
          loading={loading}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
          <div className="p-5 border-b border-primary-50 flex items-center justify-between">
            <h2 className="font-semibold text-primary">Recent Payments</h2>
            <Link href="/admin/payments" className="text-primary-lighter hover:text-primary text-xs font-medium flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-primary-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="p-8 text-center text-primary-lighter text-sm">No payments yet</div>
          ) : (
            <div className="divide-y divide-primary-50">
              {recentPayments.map((p) => (
                <div key={p._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-primary-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-xs font-bold text-primary">
                      {p.student?.fullName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{p.student?.fullName}</p>
                      <p className="text-xs text-primary-lighter">{formatDate(p.receivedDate)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{formatCurrency(p.amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.mode === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {p.mode}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Due Soon */}
        <div className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
          <div className="p-5 border-b border-primary-50 flex items-center justify-between">
            <h2 className="font-semibold text-primary">Payment Dues & Alerts</h2>
            <Link href="/admin/reports" className="text-primary-lighter hover:text-primary text-xs font-medium flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-primary-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : dueSoon.length === 0 ? (
            <div className="p-8 text-center text-green-600 text-sm">All students are up to date!</div>
          ) : (
            <div className="divide-y divide-primary-50">
              {dueSoon.map((s) => (
                <div key={s._id} className="px-4 py-3 flex items-center gap-3 hover:bg-primary-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 overflow-hidden">
                    {s.photo
                      ? <img src={`${apiBase}${s.photo}`} alt="" className="w-full h-full object-cover" />
                      : s.fullName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{s.fullName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-xs font-semibold ${s.hasDues ? 'text-red-600' : 'text-orange-500'}`}>
                        {s.hasDues ? 'Overdue' : `Due in ${s.daysUntilDue}d`}
                      </span>
                      {s.dueDate && (
                        <span className="text-xs text-primary-lighter">
                          · {formatDate(s.dueDate, 'dd MMM yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    {(() => {
                      const waUrl = getWhatsAppUrl(s, s.dueDate, s.libraryFees);
                      return waUrl ? (
                        <a href={waUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-500 text-white hover:bg-green-600 active:scale-95 transition-all shadow-sm"
                          title="Send WhatsApp reminder">
                          <WhatsAppIcon size={13} />
                        </a>
                      ) : null;
                    })()}
                    <button
                      onClick={() => setPayStudent(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold text-primary-dark text-xs font-bold hover:bg-gold-light active:scale-95 transition-all shadow-sm"
                    >
                      <CreditCard className="w-3 h-3" />
                      Pay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Pay Modal */}
      <AnimatePresence>
        {payStudent && (
          <PaymentModal
            student={payStudent}
            onClose={() => setPayStudent(null)}
            onSuccess={() => { setPayStudent(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
