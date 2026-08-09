'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Armchair, Search, Phone, User, ChevronRight, LayoutGrid, List,
  DoorOpen, Building2, Clock, ChevronDown, Check, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { BATCHES } from '@/lib/utils';

// ── Multi-select batch filter ──────────────────────────────────────────────
function BatchMultiSelect({ selectedBatches, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const toggle = (b) =>
    onChange(selectedBatches.includes(b) ? selectedBatches.filter(x => x !== b) : [...selectedBatches, b]);

  const label = selectedBatches.length === 0
    ? 'All Batches'
    : `${selectedBatches.length} batch${selectedBatches.length > 1 ? 'es' : ''} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="input-field pl-9 w-auto min-w-[200px] flex items-center justify-between gap-2 text-left"
      >
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-lighter w-4 h-4 pointer-events-none" />
        <span className={selectedBatches.length ? 'text-primary font-medium' : 'text-primary-lighter'}>
          {label}
        </span>
        <ChevronDown className={`w-4 h-4 text-primary-lighter transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1.5 bg-white border border-primary-100 rounded-xl shadow-lg z-20 py-1.5 min-w-[220px]"
          >
            {selectedBatches.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="w-full px-4 py-1.5 text-xs text-primary-lighter hover:text-primary flex items-center gap-1.5 hover:bg-primary-50"
              >
                <X className="w-3 h-3" /> Clear selection
              </button>
            )}
            {BATCHES.map(b => {
              const checked = selectedBatches.includes(b);
              return (
                <label key={b} className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50 cursor-pointer select-none">
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      checked ? 'bg-primary border-primary' : 'border-gray-300'
                    }`}
                  >
                    {checked && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(b)} />
                  <span className={`text-sm ${checked ? 'text-primary font-medium' : 'text-gray-600'}`}>{b}</span>
                </label>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Returns the earliest nextDueDate across an array of occupants, as a Date or null
function earliestDue(occupants) {
  const dates = occupants
    .map(o => o.nextDueDate ? new Date(o.nextDueDate) : null)
    .filter(Boolean);
  if (!dates.length) return null;
  return dates.reduce((min, d) => d < min ? d : min);
}

// Short format: "15 Aug"
function fmtShort(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ── Seat cell ──────────────────────────────────────────────────────────────
// seatMap[n] is now an array of occupants (one per batch)
function SeatCell({ seatNum, seatMap, selectedBatchCount, selected, onClick }) {
  const occupants = seatMap[seatNum] || [];
  const isBooked = occupants.length > 0;
  // Partial = booked in some but not all selected batches
  const isPartial = isBooked && selectedBatchCount > 1 && occupants.length < selectedBatchCount;
  const isGirl = seatNum >= 1 && seatNum <= 20;

  let colorClass;
  if (!isBooked) {
    colorClass = 'bg-white border-dashed border-gray-300 text-gray-300 hover:border-primary-200 hover:text-primary-200';
  } else if (isPartial) {
    colorClass = 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-500 text-white shadow-sm shadow-amber-200';
  } else {
    colorClass = isGirl
      ? 'bg-gradient-to-br from-pink-400 to-rose-500 border-pink-500 text-white shadow-sm shadow-pink-200'
      : 'bg-gradient-to-br from-primary to-primary-dark border-primary-dark text-white shadow-sm shadow-primary/30';
  }

  const due = isBooked ? earliestDue(occupants) : null;
  const dueShort = fmtShort(due);

  const tooltipText = isBooked
    ? `Seat ${seatNum} — ${occupants.map(o => `${o.fullName} (${o.batch})`).join(', ')}${due ? ` · Due: ${dueShort}` : ''}`
    : `Seat ${seatNum} — Available`;

  return (
    <motion.button
      whileHover={{ scale: 1.1, y: -1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(seatNum, occupants)}
      title={tooltipText}
      className={[
        'w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all border-2',
        colorClass,
        selected ? 'ring-2 ring-amber-400 ring-offset-1 scale-105' : '',
      ].join(' ')}
    >
      <span className={`text-sm font-black leading-none ${isBooked ? 'text-white/90' : ''}`}>{seatNum}</span>
      {isBooked && dueShort && (
        <span className="text-[8px] text-white/80 leading-none mt-0.5 max-w-[52px] truncate px-0.5">
          {dueShort}
        </span>
      )}
      {isBooked && !dueShort && (
        <span className="text-[8px] text-white/90 leading-none mt-1 max-w-[48px] truncate px-0.5">
          {occupants.length > 1 ? `${occupants.length} shifts` : occupants[0].fullName?.split(' ')[0]}
        </span>
      )}
      {!isBooked && <Armchair className="w-3.5 h-3.5 mt-1 opacity-40" />}
    </motion.button>
  );
}

function Col({ nums, seatMap, selectedBatchCount, selected, onClick }) {
  return (
    <div className="flex flex-col gap-1.5">
      {nums.map(n => (
        <SeatCell
          key={n} seatNum={n} seatMap={seatMap} selectedBatchCount={selectedBatchCount}
          selected={selected === n} onClick={onClick}
        />
      ))}
    </div>
  );
}

// ── Map view ───────────────────────────────────────────────────────────────
function MapView({ seats, selectedBatches }) {
  const [selected, setSelected] = useState(null);
  const [selectedOccupants, setSelectedOccupants] = useState([]);

  // Build seatMap: seatNum -> [occupant, ...] — filter by selectedBatches if any are picked
  const seatMap = {};
  seats.forEach(s => {
    if (!s.seatNumber) return;
    if (selectedBatches.length > 0 && !selectedBatches.includes(s.batch)) return;
    const num = Number(s.seatNumber);
    if (!seatMap[num]) seatMap[num] = [];
    seatMap[num].push(s);
  });

  // When no batch is selected treat as single-batch so partial coloring doesn't apply
  const selectedBatchCount = selectedBatches.length || 1;

  const totalSeats = 67;
  const bookedSeatNums = Object.keys(seatMap).length;
  const partialCount = selectedBatches.length > 1
    ? Object.values(seatMap).filter(occs => occs.length < selectedBatches.length).length
    : 0;

  const handleClick = (num, occupants) => {
    if (selected === num) { setSelected(null); setSelectedOccupants([]); return; }
    setSelected(num);
    setSelectedOccupants(occupants || []);
  };

  const primaryOccupant = selectedOccupants[0];

  return (
    <div className="space-y-4">
      {/* Legend + stats */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-primary to-primary-dark" />
          <span className="text-xs font-medium text-primary">
            Boys · {Object.entries(seatMap).filter(([n]) => Number(n) > 20).length} booked
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 rounded-lg">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-pink-400 to-rose-500" />
          <span className="text-xs font-medium text-pink-600">
            Girls · {Object.entries(seatMap).filter(([n]) => Number(n) <= 20).length} booked
          </span>
        </div>
        {partialCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-amber-400 to-orange-500" />
            <span className="text-xs font-medium text-amber-700">{partialCount} partial (some shifts)</span>
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <div className="w-3 h-3 rounded border-2 border-dashed border-gray-300" />
          <span className="text-xs font-medium text-gray-400">{totalSeats - bookedSeatNums} available</span>
        </div>
        {selectedBatches.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
            <Clock className="w-3 h-3 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">
              {selectedBatches.length === 1 ? selectedBatches[0] : `${selectedBatches.length} batches`}
            </span>
          </div>
        )}
        <div className="ml-auto text-xs text-primary-lighter font-medium">
          {bookedSeatNums}/{totalSeats} seats filled
          {selectedBatches.length > 0 ? ` (filtered)` : ''}
        </div>
      </div>

      {/* Selected seat info panel */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl border border-primary-100 p-3">
              {selectedOccupants.length === 0 ? (
                /* Available */
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm bg-gray-100 text-gray-400">
                      {selected}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400">Seat {selected}</p>
                      <p className="text-xs text-gray-300">Available</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelected(null); setSelectedOccupants([]); }}
                    className="text-gray-300 hover:text-gray-400 text-xs px-2 py-1 rounded"
                  >✕</button>
                </div>
              ) : selectedOccupants.length === 1 ? (
                /* Single occupant */
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                      selected <= 20
                        ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white'
                        : 'bg-gradient-to-br from-primary to-primary-dark text-white'
                    }`}>
                      {selected}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">{primaryOccupant.fullName}</p>
                      <p className="text-xs text-primary-lighter">
                        {primaryOccupant.mobile}
                        {primaryOccupant.batch ? ` · ${primaryOccupant.batch}` : ''}
                      </p>
                      {primaryOccupant.nextDueDate && (() => {
                        const days = Math.ceil((new Date(primaryOccupant.nextDueDate) - new Date()) / 86400000);
                        const col = days < 0 ? 'text-red-600' : days <= 7 ? 'text-orange-500' : 'text-green-600';
                        return (
                          <p className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${col}`}>
                            <Clock className="w-3 h-3" />
                            Due: {new Date(primaryOccupant.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/students/${primaryOccupant.studentId}`}
                      className="text-xs font-medium text-primary flex items-center gap-1 hover:underline"
                    >
                      View profile <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => { setSelected(null); setSelectedOccupants([]); }}
                      className="text-gray-300 hover:text-gray-400 text-xs px-2 py-1 rounded"
                    >✕</button>
                  </div>
                </div>
              ) : (
                /* Multiple occupants (multi-batch) */
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        selected <= 20
                          ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white'
                          : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                      }`}>
                        {selected}
                      </div>
                      <p className="text-sm font-semibold text-primary">
                        Seat {selected} · {selectedOccupants.length} shifts booked
                      </p>
                    </div>
                    <button
                      onClick={() => { setSelected(null); setSelectedOccupants([]); }}
                      className="text-gray-300 hover:text-gray-400 text-xs px-2 py-1 rounded"
                    >✕</button>
                  </div>
                  <div className="space-y-1.5">
                    {selectedOccupants.map((occ, i) => (
                      <div
                        key={`${occ.studentId}-${i}`}
                        className="flex items-center justify-between bg-primary-50/60 rounded-lg px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-primary">{occ.fullName}</p>
                          <p className="text-xs text-primary-lighter">
                            {occ.batch}{occ.mobile ? ` · ${occ.mobile}` : ''}
                          </p>
                          {occ.nextDueDate && (() => {
                            const days = Math.ceil((new Date(occ.nextDueDate) - new Date()) / 86400000);
                            const col = days < 0 ? 'text-red-600' : days <= 7 ? 'text-orange-500' : 'text-green-600';
                            return (
                              <p className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${col}`}>
                                <Clock className="w-3 h-3" />
                                Due: {new Date(occ.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            );
                          })()}
                        </div>
                        <Link
                          href={`/admin/students/${occ.studentId}`}
                          className="text-xs font-medium text-primary flex items-center gap-1 hover:underline flex-shrink-0"
                        >
                          View <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floor plan */}
      <div className="bg-gradient-to-br from-amber-50/60 via-stone-50 to-orange-50/40 rounded-2xl border border-primary-100 p-6 overflow-x-auto">
        <div className="min-w-[900px] flex gap-5 items-stretch">

          {/* ── LEFT / MAIN CONTENT ── */}
          <div className="flex-1 flex flex-col">

            {/* Back wall row (45-55) */}
            <div className="mb-4">
              <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 pl-1">Back Wall</div>
              <div className="flex gap-1.5">
                {[55,54,53,52,51,50,49,48,47,46,45].map(n => (
                  <SeatCell
                    key={n} seatNum={n} seatMap={seatMap} selectedBatchCount={selectedBatchCount}
                    selected={selected === n} onClick={handleClick}
                  />
                ))}
              </div>
            </div>

            {/* Extension cluster (56-67) — 2 rows × 6 */}
            <div className="flex items-start mb-5">
              <div className="w-[140px] shrink-0" />
              <div>
                <div className="text-[9px] font-bold text-primary-lighter uppercase tracking-widest mb-1.5 text-center">Extension · Boys</div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-1.5">
                    {[56,57,58,59,60,61].map(n => (
                      <SeatCell
                        key={n} seatNum={n} seatMap={seatMap} selectedBatchCount={selectedBatchCount}
                        selected={selected === n} onClick={handleClick}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    {[67,66,65,64,63,62].map(n => (
                      <SeatCell
                        key={n} seatNum={n} seatMap={seatMap} selectedBatchCount={selectedBatchCount}
                        selected={selected === n} onClick={handleClick}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 border-t border-dashed border-primary-100" />
              <span className="text-[9px] font-bold text-primary-lighter uppercase tracking-widest px-1">Main Seating Area</span>
              <div className="flex-1 border-t border-dashed border-primary-100" />
            </div>

            {/* Girls section */}
            <div className="flex items-start flex-1">
              <div>
                <div className="text-[9px] font-bold text-pink-400 uppercase tracking-widest mb-1.5 text-center">Girls Section</div>
                <div className="flex gap-1.5">
                  <Col nums={[11,10,9,8,7,6,5,4,3,2,1]} seatMap={seatMap} selectedBatchCount={selectedBatchCount} selected={selected} onClick={handleClick} />
                  <Col nums={[12,13,14,15,16,17,18,19,20]} seatMap={seatMap} selectedBatchCount={selectedBatchCount} selected={selected} onClick={handleClick} />
                </div>
              </div>
            </div>

            {/* Office cabin label */}
            <div className="mt-6 pt-4 border-t border-dashed border-stone-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700/70">
                <Building2 className="w-3.5 h-3.5" />
                Office Cabin
              </div>
            </div>
          </div>

          {/* ── RIGHT WALL STRIP ── */}
          <div className="flex flex-col items-end border-l border-dashed border-primary-100 pl-5">

            <div className="mb-3">
              <div className="text-[9px] font-bold text-primary-lighter uppercase tracking-widest mb-1.5 text-right">Corner</div>
              <div className="flex flex-col gap-1.5 items-end">
                <SeatCell seatNum={44} seatMap={seatMap} selectedBatchCount={selectedBatchCount} selected={selected === 44} onClick={handleClick} />
                <SeatCell seatNum={43} seatMap={seatMap} selectedBatchCount={selectedBatchCount} selected={selected === 43} onClick={handleClick} />
                <div className="flex gap-1.5">
                  {[39,40,41,42].map(n => (
                    <SeatCell
                      key={n} seatNum={n} seatMap={seatMap} selectedBatchCount={selectedBatchCount}
                      selected={selected === n} onClick={handleClick}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end flex-1">
              <div className="text-[9px] font-bold text-primary-lighter uppercase tracking-widest mb-1.5 text-right">Boys · Block A &amp; B</div>
              <div className="flex gap-1.5">
                <Col nums={[26,25,24,23,22,21]} seatMap={seatMap} selectedBatchCount={selectedBatchCount} selected={selected} onClick={handleClick} />
                <Col nums={[27,28,29,30,31,32]} seatMap={seatMap} selectedBatchCount={selectedBatchCount} selected={selected} onClick={handleClick} />
                <Col nums={[38,37,36,35,34,33]} seatMap={seatMap} selectedBatchCount={selectedBatchCount} selected={selected} onClick={handleClick} />
              </div>
            </div>

            <div className="mt-3 pt-4 border-t border-dashed border-stone-200 w-full flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700/70">
                Entrance · Main Gate
                <DoorOpen className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function SeatMapPage() {
  const [allSeats, setAllSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('map');
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [seatNumber, setSeatNumber] = useState('');
  const [debouncedSeat, setDebouncedSeat] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSeat(seatNumber), 300);
    return () => clearTimeout(t);
  }, [seatNumber]);

  const fetchSeats = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/students/seats');
      setAllSeats(data.seats);
    } catch {
      toast.error('Failed to load seat map');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSeats(); }, [fetchSeats]);

  // Client-side filtering for list view
  const seats = allSeats.filter(s => {
    if (selectedBatches.length > 0 && !selectedBatches.includes(s.batch)) return false;
    if (view === 'list' && debouncedSeat && !String(s.seatNumber || '').includes(debouncedSeat)) return false;
    return true;
  });

  const groupedByBatch = seats.reduce((acc, s) => {
    (acc[s.batch] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2.5">
            <Armchair className="w-7 h-7" />
            Seat Map
          </h1>
          <p className="text-primary-lighter mt-1">
            {view === 'map' ? 'Visual floor plan — click any seat to view details' : 'Browse students by batch or seat number'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Multi-select batch filter */}
          <BatchMultiSelect selectedBatches={selectedBatches} onChange={setSelectedBatches} />

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-primary-50 rounded-xl p-1">
            <button
              onClick={() => setView('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'map' ? 'bg-white text-primary shadow-sm' : 'text-primary-lighter hover:text-primary'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Map
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'list' ? 'bg-white text-primary shadow-sm' : 'text-primary-lighter hover:text-primary'
              }`}
            >
              <List className="w-4 h-4" /> List
            </button>
          </div>
        </div>
      </div>

      {/* Seat number search — list view only */}
      {view === 'list' && (
        <div className="bg-white rounded-2xl border border-primary-100 p-4 flex flex-wrap gap-3 items-center mb-6">
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
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-primary-100 animate-pulse" />
          ))}
        </div>
      ) : view === 'map' ? (
        <MapView seats={allSeats} selectedBatches={selectedBatches} />
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
                    {s.nextDueDate && (() => {
                      const days = Math.ceil((new Date(s.nextDueDate) - new Date()) / 86400000);
                      const col = days < 0 ? 'text-red-600 bg-red-50' : days <= 7 ? 'text-orange-600 bg-orange-50' : 'text-green-700 bg-green-50';
                      return (
                        <div className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${col}`}>
                          <Clock className="w-3 h-3" />
                          {new Date(s.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      );
                    })()}
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
