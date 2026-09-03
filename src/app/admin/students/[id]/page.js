'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Calendar, IndianRupee,
  CreditCard, Edit, Save, X, Key, Upload, Camera, Plus, Check, Clock, Trash2, AlertTriangle, Hash, Armchair, UserX, UserCheck, History
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate, formatDateTime, formatCurrency, getPaymentStatus, formatCoverageLabel, formatDaysBetween, MONTH_NAMES, photoUrl, getWhatsAppUrl, getAdmissionWhatsAppUrl, getPaymentRecordedWhatsAppUrl, BATCHES, SHIFT_FEES, NIGHT_SHIFT, NIGHT_SHIFT_FEE, computeStandardFee, computeFlexiFee, blockNumberSpin, toLocalDateStr, toLocalDateTimeStr } from '@/lib/utils';
import StudentAvatar from '@/components/StudentAvatar';

const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);
import PaymentModal from '@/components/admin/PaymentModal';
import CameraCapture from '@/components/admin/CameraCapture';
import CopyButton from '@/components/CopyButton';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentDetailPage() {
  const { user } = useAuth();
  const canModify = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const canPay = user?.role === 'MANAGER' || canModify; // VIEWER excluded
  const { id } = useParams();
  const router = useRouter();
  const fetchedFor = useRef(null);

  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(() =>
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('edit') === 'true'
  );
  const [saving, setSaving] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showResetPass, setShowResetPass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [form, setForm] = useState({});
  const [seatAssignments, setSeatAssignments] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(false);
  const [pendingDeletePayment, setPendingDeletePayment] = useState(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState(null);
  const [statusModal, setStatusModal] = useState(null); // null | 'deactivate' | 'readmit'
  const [statusDate, setStatusDate] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/students/${id}`);
      setStudent(data.student);
      setPayments(data.payments);
      setForm({
        fullName: data.student.fullName,
        mobile: data.student.mobile || '',
        whatsappNumber: data.student.whatsappNumber || '',
        email: data.student.email || '',
        address: data.student.address || '',
        admissionDate: data.student.admissionDate?.split('T')[0] || '',
        libraryFees: data.student.libraryFees || 0,
        isActive: data.student.isActive,
      });
      setSeatAssignments((data.student.seatAssignments || []).map(a => ({ ...a })));
    } catch { toast.error('Failed to load student'); }
    setLoading(false);
  };

  const addSeatRow = () => setSeatAssignments(rows => [...rows, { batch: '', seatNumber: '', remarks: '' }]);
  const removeSeatRow = (index) => setSeatAssignments(rows => rows.filter((_, i) => i !== index));
  const updateSeatRow = (index, field, value) =>
    setSeatAssignments(rows => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));

  useEffect(() => {
    if (fetchedFor.current === id) return;
    fetchedFor.current = id;
    fetchData();
  }, [id]);

  const handlePhotoSelect = (file) => {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const validRows = seatAssignments.filter(r => r.batch);
    if (validRows.length === 0) {
      return toast.error('Select at least one batch');
    }
    const batchesUsed = validRows.map(r => r.batch);
    if (new Set(batchesUsed).size !== batchesUsed.length) {
      return toast.error('Only one seat can be assigned per batch — remove the duplicate batch row');
    }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('seatAssignments', JSON.stringify(validRows));
      if (photoFile) fd.append('photo', photoFile);
      const { data } = await api.put(`/students/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStudent(data.student);
      setEditing(false);
      toast.success('Student updated!');
    } catch (err) { toast.error(err?.response?.data?.message || 'Update failed'); }
    setSaving(false);
  };

  const handleResetPassword = async () => {
    if (!newPass.trim()) return;
    try {
      await api.patch(`/students/${id}/password`, { password: newPass });
      toast.success('Password reset successfully!');
      setShowResetPass(false);
      setNewPass('');
    } catch { toast.error('Failed to reset password'); }
  };

  const handleDeleteStudent = async () => {
    setDeletingStudent(true);
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted successfully');
      router.push('/admin/students');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete student');
      setDeletingStudent(false);
    }
  };

  const openStatusModal = (mode) => {
    setStatusDate(mode === 'deactivate' ? toLocalDateTimeStr(new Date()) : toLocalDateStr(new Date()));
    setStatusModal(mode);
  };

  const handleStatusChange = async () => {
    if (!statusDate) return toast.error('Please pick a date');
    setStatusSaving(true);
    try {
      if (statusModal === 'deactivate') {
        // statusDate is a naive "datetime-local" string (e.g. "2026-09-03T22:40")
        // with no timezone info. The browser reliably parses it as the user's
        // OWN local time, so convert it to an absolute ISO instant here — if we
        // sent the naive string as-is, the backend (which may run in a
        // different timezone, e.g. UTC on the server) would reinterpret those
        // same digits as ITS local time and silently shift the clock.
        const inactiveDate = new Date(statusDate).toISOString();
        const { data } = await api.patch(`/students/${id}/deactivate`, { inactiveDate });
        setStudent(data.student);
        toast.success('Student marked inactive');
      } else {
        const { data } = await api.patch(`/students/${id}/readmit`, { readmissionDate: statusDate });
        setStudent(data.student);
        toast.success('Student readmitted — due date resets from today');
      }
      setStatusModal(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    }
    setStatusSaving(false);
  };

  const handleDeletePayment = async (paymentId) => {
    setDeletingPaymentId(paymentId);
    try {
      await api.delete(`/payments/${paymentId}`);
      setPayments(prev => prev.filter(p => p._id !== paymentId));
      setPendingDeletePayment(null);
      toast.success('Payment deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete payment');
    } finally {
      setDeletingPaymentId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-primary-100 rounded" />
          <div className="h-64 bg-white rounded-2xl border border-primary-100" />
        </div>
      </div>
    );
  }

  if (!student) return <div className="text-center py-16 text-primary-lighter">Student not found</div>;

  const payStatus = getPaymentStatus(student.admissionDate, payments);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-6">
        <Link href="/admin/students" className="flex-shrink-0 p-2 rounded-xl hover:bg-primary-100 text-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-primary break-words">{student.fullName}</h1>
          <p className="text-primary-lighter text-sm">Student Profile</p>
        </div>
        <div className="flex-shrink-0 flex gap-1.5 sm:gap-2">
          {!editing ? (
            <>
              {canModify && (
                <button onClick={() => setShowDeleteConfirm(true)} title="Delete"
                  className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors">
                  <Trash2 size={15} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
              {canModify && (
                <button onClick={() => setEditing(true)} title="Edit"
                  className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl border border-primary-200 text-primary text-sm hover:bg-primary-50">
                  <Edit size={16} />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}
              {canPay && (
                <button onClick={() => setShowPaymentModal(true)} title="Add Payment"
                  className="btn-primary flex items-center gap-1.5 text-sm px-2.5 sm:px-4 py-2">
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add Payment</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={() => setEditing(false)} title="Cancel"
                className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl border border-primary-200 text-primary text-sm hover:bg-primary-50">
                <X size={16} />
                <span className="hidden sm:inline">Cancel</span>
              </button>
              <button onClick={handleSave} disabled={saving} title="Save"
                className="btn-primary flex items-center gap-1.5 text-sm px-2.5 sm:px-4 py-2">
                <Save size={16} />
                <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 min-w-0">
        {/* Left: Profile card */}
        <div className="lg:col-span-1 space-y-5 min-w-0">
          <div className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
            {/* Photo */}
            <div className="bg-gradient-to-br from-primary to-primary-light h-40 flex items-center justify-center relative">
              <div className="w-24 h-24 rounded-2xl bg-white/20 border-4 border-white/30 flex items-center justify-center overflow-hidden">
                <StudentAvatar
                  src={photoPreview || photoUrl(student.photo)}
                  alt={student.fullName}
                  imgClassName="w-full h-full object-cover"
                  fallback={<User className="w-10 h-10 text-white/60" />}
                />
              </div>
              {editing && (
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <label className="cursor-pointer bg-gold text-primary-dark p-2 rounded-xl shadow-lg hover:bg-gold-light transition-colors" title="Upload Photo">
                    <Upload size={14} />
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const f = e.target.files[0];
                      if (f) handlePhotoSelect(f);
                    }} />
                  </label>
                  <button type="button" onClick={() => setShowCamera(true)} className="bg-white text-primary p-2 rounded-xl shadow-lg hover:bg-primary-50 transition-colors" title="Take Photo">
                    <Camera size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className={`flex-1 min-w-0 break-words text-center py-2 px-3 rounded-xl text-sm font-medium ${
                  student.isActive
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {student.isActive ? 'Active Member' : `Inactive${student.inactiveDate ? ` since ${formatDateTime(student.inactiveDate)}` : ''}`}
                </span>
                {canModify && (
                  student.isActive ? (
                    <button onClick={() => openStatusModal('deactivate')}
                      title="Mark Inactive"
                      className="flex-shrink-0 p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                      <UserX size={16} />
                    </button>
                  ) : (
                    <button onClick={() => openStatusModal('readmit')}
                      title="Readmit Student"
                      className="flex-shrink-0 p-2.5 rounded-xl border border-green-200 text-green-600 hover:bg-green-50 transition-colors">
                      <UserCheck size={16} />
                    </button>
                  )
                )}
              </div>

              <div className={`text-center py-2 px-3 rounded-xl text-sm font-medium ${
                payStatus.status === 'due' ? 'bg-red-50 text-red-700 border border-red-200' :
                payStatus.status === 'due-soon' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {payStatus.label}
              </div>

              <div className="space-y-2 text-sm">
                {[
                  { icon: Hash, label: 'Username', value: student.username || '—', copyable: true },
                  { icon: Calendar, label: student.admissionHistory?.length ? 'Rejoined' : 'Joined', value: formatDate(student.admissionDate) },
                  { icon: IndianRupee, label: 'Fees', value: (() => { const std = computeStandardFee((student.seatAssignments || []).map(a => a.batch)); return `${formatCurrency(student.libraryFees)}/mo${std && std !== student.libraryFees ? ` (standard: ${formatCurrency(std)})` : ''}`; })() },
                  { icon: Phone, label: 'Mobile', value: student.mobile || '—' },
                  { icon: Phone, label: 'WhatsApp', value: student.whatsappNumber || student.mobile || '—' },
                  { icon: Mail, label: 'Email', value: student.email || '—' },
                  { icon: MapPin, label: 'Address', value: student.address || '—' },
                ].map(({ icon: Icon, label, value, copyable }) => (
                  <div key={label} className="flex items-start gap-2 text-primary-lighter">
                    <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="text-primary-lighter flex-shrink-0">{label}:</span>
                    <span className="text-primary font-medium min-w-0 break-words">{value}</span>
                    {copyable && student.username && (
                      <CopyButton value={student.username} className="text-primary-lighter hover:text-primary flex-shrink-0" />
                    )}
                  </div>
                ))}
                {/* Next Due Date */}
                {(() => {
                  const days = student.nextDueDate ? Math.ceil((new Date(student.nextDueDate) - new Date()) / 86400000) : null;
                  const col = days === null ? 'text-primary' : days < 0 ? 'text-red-600' : days <= 7 ? 'text-orange-500' : 'text-green-600';
                  return (
                    <div className="flex items-start gap-2 text-primary-lighter">
                      <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="text-primary-lighter flex-shrink-0">Next Due:</span>
                      <span className={`font-semibold min-w-0 break-words ${col}`}>
                        {student.nextDueDate ? formatDate(student.nextDueDate, 'dd MMM yyyy') : payStatus.dueDateLabel}
                      </span>
                    </div>
                  );
                })()}
                <div className="flex items-start gap-2 text-primary-lighter">
                  <Armchair className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="text-primary-lighter flex-shrink-0">Batches:</span>
                  {student.seatAssignments?.length ? (
                    <div className="flex flex-col gap-1 min-w-0">
                      {student.seatAssignments.map(a => {
                        const isFlexi = !a.seatNumber;
                        return (
                          <div key={a.batch} className="flex flex-col gap-0.5">
                            <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-2 py-0.5 rounded-lg w-fit ${isFlexi ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-300' : 'text-primary'}`}>
                              {a.batch}
                              {isFlexi
                                ? <span className="text-xs font-bold">· Flexi Batch</span>
                                : <span className="text-primary-lighter font-normal">· Seat {a.seatNumber}</span>}
                            </span>
                            {a.remarks && (
                              <span className="text-xs text-primary-lighter pl-2 italic break-words">"{a.remarks}"</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-primary font-medium">Not decided</span>
                  )}
                </div>
              </div>

              {/* WhatsApp buttons — hidden for VIEWER */}
              {canPay && (() => {
                const effectiveFee = computeStandardFee((student.seatAssignments || []).map(a => a.batch)) || student.libraryFees;
                const waUrl = getWhatsAppUrl(student, student.nextDueDate, effectiveFee);
                const admUrl = getAdmissionWhatsAppUrl(student);
                return (waUrl || admUrl) ? (
                  <div className="mt-3 space-y-2">
                    {waUrl && (
                      <a href={waUrl} target="_blank" rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors shadow-sm">
                        <WhatsAppIcon size={15} />
                        Send Fee Reminder
                      </a>
                    )}
                    {admUrl && (
                      <a href={admUrl} target="_blank" rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
                        <WhatsAppIcon size={15} />
                        Send Admission Successful
                      </a>
                    )}
                  </div>
                ) : null;
              })()}

              {canModify && (
              <button
                onClick={() => setShowResetPass(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-orange-200 text-orange-600 text-sm font-medium hover:bg-orange-50 transition-colors mt-2"
              >
                <Key size={14} />
                Reset Password
              </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Edit form / Payment history */}
        <div className="lg:col-span-2 space-y-5 min-w-0">
          {editing ? (
            <div className="bg-white rounded-2xl border border-primary-100 p-6">
              <h2 className="font-semibold text-primary mb-5">Edit Student Details</h2>
              <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-primary mb-1.5">Full Name *</label>
                  <input required value={form.fullName || ''} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5">Mobile</label>
                  <input value={form.mobile || ''} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5 flex items-center gap-1.5">
                    <WhatsAppIcon size={12} /> WhatsApp Number
                  </label>
                  <input value={form.whatsappNumber || ''} onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))} placeholder="If different from mobile" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5">Email</label>
                  <input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-primary mb-1.5">Address</label>
                  <textarea rows={2} value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="input-field resize-none" />
                </div>
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-primary mb-1.5">Admission Date</label>
                  <input type="date" value={form.admissionDate || ''} onChange={e => setForm(f => ({ ...f, admissionDate: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5">Monthly Fees (₹)</label>
                  <input type="number" min="0" value={form.libraryFees || 0}
                    onChange={e => setForm(f => ({ ...f, libraryFees: e.target.value }))}
                    {...blockNumberSpin} className="input-field" />
                  {(() => {
                    const selectedBatches = seatAssignments.filter((r) => r.batch).map((r) => r.batch);
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
                    const isCustom = parseFloat(form.libraryFees) !== standard;
                    return (
                      <p className="text-xs text-primary-lighter mt-1">
                        {hint}
                        {isCustom && (
                          <button type="button"
                            onClick={() => setForm(f => ({ ...f, libraryFees: standard }))}
                            className="ml-2 text-primary underline underline-offset-2">
                            Reset to standard
                          </button>
                        )}
                      </p>
                    );
                  })()}
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-primary flex items-center gap-1.5">
                      <Armchair className="w-3.5 h-3.5" /> Batch(es) *
                    </label>
                    <button type="button" onClick={addSeatRow} className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark">
                      <Plus className="w-3.5 h-3.5" /> Add Batch
                    </button>
                  </div>
                  {seatAssignments.length === 0 ? (
                    <p className="text-xs text-red-500">At least one batch is required — click &ldquo;Add Batch&rdquo; to assign one.</p>
                  ) : (
                    <div className="space-y-3">
                      {seatAssignments.map((row, i) => {
                        const otherBatches = seatAssignments.filter((_, idx) => idx !== i).map(r => r.batch);
                        const availableBatches = BATCHES.filter(b => b === row.batch || !otherBatches.includes(b));
                        const isFlexi = row.batch && !row.seatNumber;
                        return (
                        <div key={i} className={`rounded-xl border p-3 space-y-2 ${isFlexi ? 'border-orange-200 bg-orange-50/50' : 'border-primary-100 bg-primary-50/30'}`}>
                          <div className="flex gap-2 items-center flex-wrap">
                            <select
                              value={row.batch}
                              onChange={e => updateSeatRow(i, 'batch', e.target.value)}
                              className="input-field flex-1 min-w-[140px] text-sm"
                            >
                              <option value="">Select batch *</option>
                              {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <input
                              value={row.seatNumber}
                              onChange={e => updateSeatRow(i, 'seatNumber', e.target.value)}
                              placeholder="Seat (optional)"
                              className="input-field w-28 flex-shrink-0 text-sm"
                            />
                            <button type="button" onClick={() => removeSeatRow(i)} className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {isFlexi && (
                            <p className="text-xs text-orange-600 font-medium px-1">⚡ Flexi Batch — no fixed seat · Fee: ₹{computeFlexiFee(seatAssignments.filter(r => r.batch && !r.seatNumber).length)}/mo</p>
                          )}
                          <input
                            value={row.remarks || ''}
                            onChange={e => updateSeatRow(i, 'remarks', e.target.value)}
                            placeholder="Remarks (e.g. will come from 8AM, window seat preference…)"
                            className="input-field w-full text-sm"
                          />
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <p className="sm:col-span-2 text-xs text-primary-lighter -mt-1">
                  Active/Inactive status is managed via the button next to the status badge on the left — not from this form, so a rejoin always records proper history.
                </p>
              </form>
            </div>
          ) : null}

          {/* Payment History */}
          <div className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
            <div className="p-5 border-b border-primary-50 flex items-center justify-between">
              <h2 className="font-semibold text-primary">Payment History</h2>
              <span className="text-xs text-primary-lighter">{payments.length} records</span>
            </div>
            {payments.length === 0 ? (
              <div className="p-8 text-center text-primary-lighter text-sm">No payments recorded yet</div>
            ) : (
              <>
                {/* Mobile: stacked cards — a 5-column table would force horizontal
                    scrolling on narrow screens, so each payment wraps as its own block instead. */}
                <div className="sm:hidden divide-y divide-primary-50">
                  {payments.map((p) => (
                    pendingDeletePayment === p._id ? (
                      <div key={p._id} className="p-4 bg-red-50">
                        <p className="text-sm text-red-700 font-medium mb-3 break-words">
                          Delete {formatCurrency(p.amount)} payment on {formatDate(p.receivedDate)}?
                        </p>
                        <div className="flex gap-2">
                          <button onClick={() => setPendingDeletePayment(null)}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-primary-200 text-primary text-xs hover:bg-white transition-colors">
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeletePayment(p._id)}
                            disabled={deletingPaymentId === p._id}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5">
                            {deletingPaymentId === p._id
                              ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                              : <Trash2 size={12} />}
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div key={p._id} className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-primary break-words min-w-0">{formatCurrency(p.amount)}</span>
                          <span className="text-xs text-primary-lighter flex-shrink-0">{formatDate(p.receivedDate)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 flex-wrap mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full break-words ${p.mode === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {p.mode}{p.referenceNo ? ` · ${p.referenceNo}` : ''}
                          </span>
                          <span className="text-xs text-primary-lighter break-words min-w-0">
                            {formatCoverageLabel(p) || '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5 mt-2">
                          {canPay && (() => {
                            const waUrl = getPaymentRecordedWhatsAppUrl({ ...p, student });
                            return waUrl ? (
                              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                                title="Send payment confirmation via WhatsApp"
                                className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-500 text-white hover:bg-green-600 active:scale-95 transition-all">
                                <WhatsAppIcon size={13} />
                              </a>
                            ) : null;
                          })()}
                          {canModify && (
                            <button onClick={() => setPendingDeletePayment(p._id)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  ))}
                </div>

                {/* Tablet & up: full table */}
                <div className="hidden sm:block table-responsive">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary-50">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-primary-lighter uppercase tracking-wide">Date</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-primary-lighter uppercase tracking-wide">Amount</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-primary-lighter uppercase tracking-wide">Mode</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-primary-lighter uppercase tracking-wide">Covers</th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-50">
                      {payments.map((p) => (
                        pendingDeletePayment === p._id ? (
                          <tr key={p._id} className="bg-red-50">
                            <td colSpan={5} className="px-5 py-3.5">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-red-700 font-medium min-w-0 break-words">
                                  Delete {formatCurrency(p.amount)} payment on {formatDate(p.receivedDate)}?
                                </span>
                                <div className="flex gap-2 flex-shrink-0">
                                  <button onClick={() => setPendingDeletePayment(null)}
                                    className="px-3 py-1.5 rounded-lg border border-primary-200 text-primary text-xs hover:bg-white transition-colors">
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleDeletePayment(p._id)}
                                    disabled={deletingPaymentId === p._id}
                                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-1.5">
                                    {deletingPaymentId === p._id
                                      ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                                      : <Trash2 size={12} />}
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr key={p._id} className="hover:bg-primary-50 transition-colors group">
                            <td className="px-5 py-3.5 text-sm text-primary">{formatDate(p.receivedDate)}</td>
                            <td className="px-5 py-3.5 text-sm font-semibold text-primary">{formatCurrency(p.amount)}</td>
                            <td className="px-5 py-3.5">
                              <span className={`text-xs px-2 py-1 rounded-full ${p.mode === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {p.mode}{p.referenceNo ? ` · ${p.referenceNo}` : ''}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-primary-lighter">
                              {formatCoverageLabel(p) || '—'}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end gap-1.5">
                                {canPay && (() => {
                                  const waUrl = getPaymentRecordedWhatsAppUrl({ ...p, student });
                                  return waUrl ? (
                                    <a href={waUrl} target="_blank" rel="noopener noreferrer"
                                      title="Send payment confirmation via WhatsApp"
                                      className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-500 text-white hover:bg-green-600 active:scale-95 transition-all">
                                      <WhatsAppIcon size={13} />
                                    </a>
                                  ) : null;
                                })()}
                                {canModify && (
                                  <button onClick={() => setPendingDeletePayment(p._id)}
                                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Membership History — only shown once there's more than a single, ongoing stint */}
          {(student.admissionHistory?.length > 0 || !student.isActive) && (
            <div className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
              <div className="p-5 border-b border-primary-50 flex items-center gap-2">
                <History className="w-4 h-4 text-primary-lighter" />
                <h2 className="font-semibold text-primary">Membership History</h2>
              </div>
              <div className="p-5 space-y-3">
                {student.admissionHistory?.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary-200 flex-shrink-0 mt-1.5" />
                    <span className="text-primary-lighter min-w-0 break-words">
                      Joined <span className="text-primary font-medium">{formatDate(h.admissionDate)}</span>
                      {' '}&rarr; Inactive from <span className="text-primary font-medium">{formatDateTime(h.inactiveDate)}</span>
                      {' '}<span className="text-xs text-primary-lighter">({formatDaysBetween(h.admissionDate, h.inactiveDate)})</span>
                    </span>
                  </div>
                ))}
                <div className="flex items-start gap-3 text-sm">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${student.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-primary-lighter min-w-0 break-words">
                    {student.admissionHistory?.length ? 'Rejoined' : 'Joined'}{' '}
                    <span className="text-primary font-medium">{formatDate(student.admissionDate)}</span>
                    {student.isActive
                      ? ' — currently active'
                      : <>
                          {' '}&rarr; Inactive from <span className="text-primary font-medium">{formatDateTime(student.inactiveDate)}</span>
                          {' '}<span className="text-xs text-primary-lighter">({formatDaysBetween(student.admissionDate, student.inactiveDate)})</span>
                        </>}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <PaymentModal
            student={student}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={() => { setShowPaymentModal(false); fetchData(); }}
          />
        )}
      </AnimatePresence>

      {showCamera && (
        <CameraCapture
          onClose={() => setShowCamera(false)}
          onCapture={(file) => { setShowCamera(false); handlePhotoSelect(file); }}
        />
      )}

      {/* Delete Student Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-primary text-base">Delete Student?</h3>
                  <p className="text-xs text-primary-lighter mt-0.5">This cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-primary-lighter mb-1">
                You are about to permanently delete <span className="font-semibold text-primary">{student.fullName}</span> and all their data:
              </p>
              <ul className="text-sm text-red-600 space-y-1 mb-5 pl-4 list-disc">
                <li>Student profile &amp; login</li>
                <li>{payments.length} payment record{payments.length !== 1 ? 's' : ''}</li>
                {student.photo && <li>Profile photo</li>}
              </ul>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-primary-200 text-primary text-sm font-medium hover:bg-primary-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDeleteStudent} disabled={deletingStudent}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                  {deletingStudent
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Trash2 size={14} />}
                  {deletingStudent ? 'Deleting…' : 'Delete Permanently'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mark Inactive / Readmit Modal */}
      <AnimatePresence>
        {statusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${statusModal === 'deactivate' ? 'bg-red-100' : 'bg-green-100'}`}>
                  {statusModal === 'deactivate'
                    ? <UserX className="w-5 h-5 text-red-600" />
                    : <UserCheck className="w-5 h-5 text-green-600" />}
                </div>
                <div>
                  <h3 className="font-bold text-primary text-base">
                    {statusModal === 'deactivate' ? 'Mark Inactive' : 'Readmit Student'}
                  </h3>
                  <p className="text-xs text-primary-lighter mt-0.5">{student.fullName}</p>
                </div>
              </div>

              {statusModal === 'readmit' && (
                <p className="text-xs text-primary-lighter mb-3">
                  Same profile, seats and payment history are kept — only the admission date resets, so fee dues start fresh from the readmission date. The prior stint is saved to their membership history.
                </p>
              )}

              <label className="block text-xs font-semibold text-primary mb-1.5">
                {statusModal === 'deactivate' ? 'Inactive Date & Time' : 'Readmission Date'}
              </label>
              <input
                type={statusModal === 'deactivate' ? 'datetime-local' : 'date'}
                value={statusDate}
                onChange={e => setStatusDate(e.target.value)}
                className="input-field mb-4"
              />

              <div className="flex gap-3">
                <button onClick={() => setStatusModal(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-primary-200 text-primary text-sm hover:bg-primary-50">
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={statusSaving}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${statusModal === 'deactivate' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {statusSaving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {statusModal === 'deactivate' ? 'Mark Inactive' : 'Readmit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetPass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h3 className="font-semibold text-primary text-lg mb-4">Reset Password</h3>
              <p className="text-sm text-primary-lighter mb-4">Set a new password for {student.fullName}</p>
              <input
                type="text"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="New password"
                className="input-field mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowResetPass(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-primary-200 text-primary text-sm hover:bg-primary-50">
                  Cancel
                </button>
                <button onClick={handleResetPassword} className="flex-1 btn-primary text-sm py-2.5">
                  Reset Password
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
