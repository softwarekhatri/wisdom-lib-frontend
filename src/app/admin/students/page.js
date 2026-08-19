'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search, UserPlus, User, Phone, Calendar, IndianRupee,
  Eye, Edit, ChevronLeft, ChevronRight, CreditCard, Clock, Download, Loader2,
  CheckCircle, XCircle, MapPin, Armchair,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate, formatCurrency, photoUrl, getWhatsAppUrl } from '@/lib/utils';
import StudentAvatar from '@/components/StudentAvatar';

const WhatsAppIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);
import AdmissionModal from '@/components/admin/AdmissionModal';
import PaymentModal from '@/components/admin/PaymentModal';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentsPage() {
  const { user } = useAuth();
  const canModify = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const canAdmit = user?.role === 'MANAGER' || canModify;
  const canPay = canAdmit; // MANAGER, ADMIN, SUPER_ADMIN — not VIEWER
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('active'); // 'all' | 'active' | 'inactive' | 'pending'
  const [pendingCount, setPendingCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAdmission, setShowAdmission] = useState(false);
  const [payStudent, setPayStudent] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Keep pending count badge fresh
  const fetchPendingCount = useCallback(async () => {
    try {
      const { data } = await api.get('/students', { params: { status: 'pending' } });
      setPendingCount(data.pagination?.total || 0);
    } catch {}
  }, []);

  useEffect(() => { fetchPendingCount(); }, [fetchPendingCount]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, search: debouncedSearch };
      if (activeFilter === 'pending') {
        params.status = 'pending';
      } else if (activeFilter === 'flexi') {
        params.active = true;
        params.flexi = true;
      } else if (activeFilter !== 'all') {
        params.active = activeFilter === 'active';
      }
      const { data } = await api.get('/students', { params });
      setStudents(data.students);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load students'); }
    setLoading(false);
  }, [page, debouncedSearch, activeFilter]);

  const [selected, setSelected] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(null);

  // Clear selection when filter changes
  useEffect(() => { setSelected(new Set()); }, [activeFilter]);

  const toggleSelect = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleSelectAll = () => {
    if (selected.size === students.length) setSelected(new Set());
    else setSelected(new Set(students.map(s => s._id)));
  };

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve');
    try {
      await api.patch(`/students/${id}/approve-admission`);
      toast.success('Admission approved — seat activated!');
      fetchStudents();
      fetchPendingCount();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve');
    }
    setActionLoading(null);
  };

  const handleDeny = async (id) => {
    if (!confirm('Deny and delete this admission request?')) return;
    setActionLoading(id + '_deny');
    try {
      await api.delete(`/students/${id}/deny-admission`);
      toast.success('Admission request denied');
      fetchStudents();
      fetchPendingCount();
    } catch {
      toast.error('Failed to deny admission');
    }
    setActionLoading(null);
  };

  const handleBulkApprove = async () => {
    if (!selected.size) return;
    setBulkLoading('approve');
    try {
      const { data } = await api.post('/students/bulk-approve-admissions', { ids: [...selected] });
      toast.success(`${data.approved?.length || 0} approved${data.failed?.length ? `, ${data.failed.length} had conflicts` : ''}`);
      setSelected(new Set());
      fetchStudents();
      fetchPendingCount();
    } catch { toast.error('Bulk approve failed'); }
    setBulkLoading(null);
  };

  const handleBulkDeny = async () => {
    if (!selected.size) return;
    if (!confirm(`Deny and delete ${selected.size} admission request(s)?`)) return;
    setBulkLoading('deny');
    try {
      await api.post('/students/bulk-deny-admissions', { ids: [...selected] });
      toast.success(`${selected.size} request(s) denied`);
      setSelected(new Set());
      fetchStudents();
      fetchPendingCount();
    } catch { toast.error('Bulk deny failed'); }
    setBulkLoading(null);
  };

  useEffect(() => { setPage(1); }, [activeFilter]);
  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get('/students/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'students.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to export students');
    }
    setExporting(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Students</h1>
          <p className="text-primary-lighter mt-1">
            {pagination ? `${pagination.total} total students` : 'Loading...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 w-fit px-4 py-2.5 rounded-xl border border-primary-200 text-primary text-sm font-medium hover:bg-primary-50 transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Excel
          </button>
          {canAdmit && (
            <button
              onClick={() => setShowAdmission(true)}
              className="btn-primary flex items-center gap-2 w-fit"
            >
              <UserPlus className="w-5 h-5" />
              Admit Student
            </button>
          )}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-lighter w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or mobile..."
            className="input-field pl-12"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-primary-50 rounded-xl border border-primary-100 max-w-full overflow-x-auto">
          {[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'flexi', label: 'Flexi Batch' },
            { value: 'pending', label: 'Pending' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`relative shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === f.value
                  ? 'bg-white text-primary shadow-sm border border-primary-100'
                  : 'text-primary-lighter hover:text-primary'
              }`}
            >
              {f.label}
              {f.value === 'pending' && pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Student grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-white rounded-2xl border border-primary-100 animate-pulse" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-primary-100">
          <User className="w-12 h-12 text-primary-lighter mx-auto mb-3" />
          <p className="text-primary-lighter">
            {activeFilter === 'pending' ? 'No pending admission requests' : 'No students found'}
          </p>
          {canAdmit && activeFilter !== 'pending' && (
            <button onClick={() => setShowAdmission(true)} className="btn-primary mt-4">
              Admit First Student
            </button>
          )}
        </div>
      ) : activeFilter === 'pending' ? (
        /* ── Pending admission requests ── */
        <div className="space-y-4">
          {/* Bulk action bar */}
          {canAdmit && (
            <div className="flex items-center gap-3 bg-white border border-primary-100 rounded-2xl px-4 py-3">
              {/* Select all checkbox */}
              <button
                onClick={toggleSelectAll}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selected.size === students.length && students.length > 0
                    ? 'bg-primary border-primary'
                    : selected.size > 0
                    ? 'bg-primary/40 border-primary'
                    : 'border-gray-300'
                }`}
              >
                {selected.size > 0 && <CheckCircle className="w-3 h-3 text-white" />}
              </button>
              <span className="text-sm text-primary-lighter flex-1">
                {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
              </span>
              {selected.size > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkApprove}
                    disabled={!!bulkLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {bulkLoading === 'approve' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    Approve {selected.size}
                  </button>
                  <button
                    onClick={handleBulkDeny}
                    disabled={!!bulkLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-100 hover:bg-red-500 text-red-600 hover:text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {bulkLoading === 'deny' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    Deny {selected.size}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {students.map((s, i) => {
              const isSelected = selected.has(s._id);
              const submittedAt = s.createdAt || s.admissionDate;
              const submittedStr = submittedAt
                ? new Date(submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '—';
              return (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-amber-200'}`}
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-400" />
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Checkbox */}
                      {canAdmit && (
                        <button
                          onClick={() => toggleSelect(s._id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? 'bg-primary border-primary' : 'border-gray-300 hover:border-primary'
                          }`}
                        >
                          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                        </button>
                      )}
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg overflow-hidden flex-shrink-0">
                        <StudentAvatar
                          src={photoUrl(s.photo)}
                          imgClassName="w-full h-full object-cover"
                          fallback={<span>{s.fullName?.charAt(0)?.toUpperCase()}</span>}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-primary text-sm truncate">{s.fullName}</p>
                        {s.mobile && (
                          <p className="text-xs text-primary-lighter flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {s.mobile}
                          </p>
                        )}
                      </div>
                    </div>

                    {s.address && (
                      <p className="text-xs text-primary-lighter flex items-start gap-1 mb-2">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{s.address}</span>
                      </p>
                    )}

                    {s.seatAssignments?.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {s.seatAssignments.map(a => {
                          const isFlexi = !a.seatNumber;
                          return (
                            <span key={a.batch} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${isFlexi ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-300' : 'bg-primary-50 text-primary'}`}>
                              <Clock className="w-3 h-3" /> {a.batch}
                              {isFlexi
                                ? <span className="ml-1 font-bold">· Flexi</span>
                                : <><Armchair className="w-3 h-3 ml-1" /> Seat {a.seatNumber}</>}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <p className="text-[10px] text-primary-lighter mb-3 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {submittedStr}
                    </p>

                    {canAdmit && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(s._id)}
                          disabled={!!actionLoading || !!bulkLoading}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {actionLoading === s._id + '_approve'
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <CheckCircle className="w-3.5 h-3.5" />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleDeny(s._id)}
                          disabled={!!actionLoading || !!bulkLoading}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-100 hover:bg-red-500 text-red-600 hover:text-white text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {actionLoading === s._id + '_deny'
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <XCircle className="w-3.5 h-3.5" />}
                          Deny
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.map((s, i) => (
            <motion.div
              key={s._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-primary-100 overflow-hidden hover:shadow-md hover:border-primary/20 transition-all group"
            >
              {/* Card top */}
              <div className="bg-gradient-to-r from-primary to-primary-light p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <StudentAvatar
                    src={photoUrl(s.photo)}
                    alt={s.fullName}
                    imgClassName="w-full h-full object-cover"
                    fallback={
                      <span className="text-white/80 font-display font-bold text-xl">
                        {s.fullName?.charAt(0)?.toUpperCase()}
                      </span>
                    }
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold truncate">{s.fullName}</h3>
                  {s.mobile && (
                    <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {s.mobile}
                    </p>
                  )}
                </div>
                <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium ${s.isActive ? 'bg-green-400/25 text-green-200' : 'bg-red-400/25 text-red-200'}`}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Card body */}
              <div className="px-5 py-3 flex items-center justify-between text-sm border-b border-primary-50">
                <span className="text-primary-lighter flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(s.admissionDate, 'MMM yyyy')}
                </span>
                <span className="text-primary font-semibold flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-primary-lighter" />
                  {formatCurrency(s.libraryFees)}<span className="text-primary-lighter font-normal">/mo</span>
                </span>
              </div>
              {s.seatAssignments?.length > 0 && (
                <div className="px-5 py-2 flex flex-wrap items-center gap-1.5 text-xs border-b border-primary-50">
                  {s.seatAssignments.map(a => {
                    const isFlexi = !a.seatNumber;
                    return (
                      <span key={a.batch} className={`px-2 py-0.5 rounded-full font-medium ${isFlexi ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-300' : 'bg-primary-50 text-primary'}`}>
                        {a.batch}{isFlexi ? ' · Flexi' : ` (${a.seatNumber})`}
                      </span>
                    );
                  })}
                </div>
              )}
              {/* Next Due Date */}
              {(() => {
                const days = s.nextDueDate ? Math.ceil((new Date(s.nextDueDate) - new Date()) / 86400000) : null;
                const col = days === null ? 'text-primary-lighter' : days < 0 ? 'text-red-600' : days <= 7 ? 'text-orange-500' : 'text-green-600';
                return (
                  <div className="px-5 py-2.5 flex items-center justify-between text-xs border-b border-primary-50">
                    <span className="text-primary-lighter flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Next Due
                    </span>
                    <span className={`font-semibold ${col}`}>
                      {s.nextDueDate ? formatDate(s.nextDueDate, 'dd MMM yyyy') : '—'}
                    </span>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className={`px-4 py-3 grid gap-1.5 ${canModify ? 'grid-cols-4' : canPay ? 'grid-cols-3' : 'grid-cols-1'}`}>
                {canPay && (
                  <button
                    onClick={() => setPayStudent(s)}
                    className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-gold text-primary-dark text-xs font-bold hover:bg-gold-light active:scale-95 transition-all shadow-sm"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Pay
                  </button>
                )}

                {canPay && (() => {
                  const waUrl = getWhatsAppUrl(s, s.nextDueDate, s.libraryFees);
                  return waUrl ? (
                    <a href={waUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-green-500 text-white text-xs font-bold hover:bg-green-600 active:scale-95 transition-all shadow-sm">
                      <WhatsAppIcon size={13} />
                      WA
                    </a>
                  ) : (
                    <span className="flex items-center justify-center py-2.5 rounded-xl bg-primary-50 text-primary-lighter text-xs cursor-not-allowed" title="No phone number">
                      <WhatsAppIcon size={13} />
                    </span>
                  );
                })()}

                <Link
                  href={`/admin/students/${s._id}`}
                  className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary-dark active:scale-95 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </Link>

                {canModify && (
                  <Link
                    href={`/admin/students/${s._id}?edit=true`}
                    className="flex items-center justify-center gap-1 py-2.5 rounded-xl border border-primary-200 text-primary text-xs font-medium hover:bg-primary-50 active:scale-95 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-xl border border-primary-200 flex items-center justify-center text-primary disabled:opacity-40 hover:bg-primary-50"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-primary-lighter font-medium">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="w-9 h-9 rounded-xl border border-primary-200 flex items-center justify-center text-primary disabled:opacity-40 hover:bg-primary-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Admission Modal */}
      <AnimatePresence>
        {showAdmission && (
          <AdmissionModal
            onClose={() => setShowAdmission(false)}
            onSuccess={() => { setShowAdmission(false); fetchStudents(); }}
          />
        )}
      </AnimatePresence>

      {/* Quick Pay Modal */}
      <AnimatePresence>
        {payStudent && (
          <PaymentModal
            student={payStudent}
            onClose={() => setPayStudent(null)}
            onSuccess={() => { setPayStudent(null); toast.success('Payment saved!'); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
