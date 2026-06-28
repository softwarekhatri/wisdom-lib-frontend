'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Eye, EyeOff, Save, BookOpen, Mail, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

function Card({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-primary-100 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-primary-50 flex items-center gap-3 bg-primary-50/40">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-primary" style={{ width: 18, height: 18 }} />
        </div>
        <h2 className="font-semibold text-primary text-base">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function AdminProfilePage() {
  const { user, setUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [passSaving, setPassSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) return toast.error('Name cannot be empty');
    setProfileSaving(true);
    try {
      const { data } = await api.patch('/auth/profile', {
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
      });
      setUser(data.user);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (passForm.newPassword.length < 4) {
      return toast.error('Password must be at least 4 characters');
    }
    setPassSaving(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setPassSaving(false);
    }
  };

  const PasswordField = ({ label, field, showKey }) => (
    <div>
      <label className="block text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={showPass[showKey] ? 'text' : 'password'}
          required
          value={passForm[field]}
          onChange={e => setPassForm(f => ({ ...f, [field]: e.target.value }))}
          placeholder="••••••••"
          className="input-field pr-11"
        />
        <button
          type="button"
          onClick={() => setShowPass(s => ({ ...s, [showKey]: !s[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-lighter hover:text-primary transition-colors"
        >
          {showPass[showKey] ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">My Profile</h1>
        <p className="text-primary-lighter mt-1">Manage your account settings</p>
      </div>

      {/* Avatar / identity card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-6 mb-6 flex items-center gap-5 text-white shadow-lg"
      >
        <div className="w-16 h-16 rounded-2xl bg-gold/30 border-2 border-gold/40 flex items-center justify-center flex-shrink-0 text-2xl font-display font-bold text-gold shadow-inner">
          {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
        </div>
        <div>
          <p className="font-display text-xl font-bold">{user?.fullName}</p>
          <p className="text-white/60 text-sm">{user?.email || user?.username}</p>
          <span className="inline-block mt-1.5 text-xs px-3 py-1 rounded-full bg-gold/20 text-gold font-semibold border border-gold/30">
            {user?.role}
          </span>
        </div>
        <div className="ml-auto">
          <BookOpen className="w-10 h-10 text-white/10" />
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Profile details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card title="Profile Information" icon={User}>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="Your full name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@wisdomlibrary.in"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">Username (Login ID)</label>
                <input
                  type="text"
                  disabled
                  value={user?.username || ''}
                  className="input-field opacity-60 cursor-not-allowed bg-primary-50"
                />
                <p className="text-xs text-primary-lighter mt-1">Username cannot be changed</p>
              </div>
              <button
                type="submit"
                disabled={profileSaving}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {profileSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : profileSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </Card>
        </motion.div>

        {/* Change password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card title="Change Password" icon={Shield}>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <PasswordField label="Current Password" field="currentPassword" showKey="current" />
              <PasswordField label="New Password" field="newPassword" showKey="new" />
              <PasswordField label="Confirm New Password" field="confirmPassword" showKey="confirm" />

              {passForm.newPassword && passForm.confirmPassword && (
                <div className={`text-xs font-medium px-3 py-2 rounded-lg ${passForm.newPassword === passForm.confirmPassword ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {passForm.newPassword === passForm.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}

              <button
                type="submit"
                disabled={passSaving}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {passSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
