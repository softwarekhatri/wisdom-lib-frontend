'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Armchair, Search, Phone, User, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { BATCHES } from '@/lib/utils';

export default function SeatMapPage() {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [debouncedSeat, setDebouncedSeat] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSeat(seatNumber), 300);
    return () => clearTimeout(t);
  }, [seatNumber]);

  const fetchSeats = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/students/seats', { params: { batch, seatNumber: debouncedSeat } });
      setSeats(data.seats);
    } catch {
      toast.error('Failed to load seat map');
    }
    setLoading(false);
  }, [batch, debouncedSeat]);

  useEffect(() => { fetchSeats(); }, [fetchSeats]);

  const groupedByBatch = seats.reduce((acc, s) => {
    (acc[s.batch] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2.5">
          <Armchair className="w-7 h-7" />
          Seat Map
        </h1>
        <p className="text-primary-lighter mt-1">Browse students by batch, or search for who holds a specific seat</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-primary-100 p-4 flex flex-wrap gap-3 items-center mb-6">
        <select
          value={batch}
          onChange={e => setBatch(e.target.value)}
          className="input-field w-auto min-w-[180px]"
        >
          <option value="">All Batches</option>
          {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-lighter w-4 h-4" />
          <input
            value={seatNumber}
            onChange={e => setSeatNumber(e.target.value)}
            placeholder="Search seat number..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-primary-100 animate-pulse" />
          ))}
        </div>
      ) : seats.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-primary-100">
          <Armchair className="w-12 h-12 text-primary-lighter mx-auto mb-3" />
          <p className="text-primary-lighter">
            {seatNumber ? 'No student holds a matching seat' : 'No students found for this filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByBatch).map(([batchName, rows]) => (
            <div key={batchName} className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-primary-50 flex items-center justify-between bg-primary-50/50">
                <h2 className="font-semibold text-primary text-sm">{batchName}</h2>
                <span className="text-xs text-primary-lighter">{rows.length} student{rows.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-primary-50">
                {rows.map((s) => (
                  <motion.div
                    key={`${s.batch}-${s.studentId}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-5 py-3 flex items-center gap-4"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      s.seatNumber ? 'bg-primary-100 text-primary' : 'bg-primary-50 text-primary-lighter'
                    }`}>
                      {s.seatNumber || '—'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary-lighter" />
                        {s.fullName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {s.mobile && (
                          <p className="text-xs text-primary-lighter flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {s.mobile}
                          </p>
                        )}
                        {!s.seatNumber && (
                          <span className="text-xs text-orange-500">No seat assigned</span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/admin/students/${s.studentId}`}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark flex-shrink-0"
                    >
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
