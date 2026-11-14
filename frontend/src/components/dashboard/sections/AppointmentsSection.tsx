import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Plus, 
  CheckCircle2, 
  User, 
  X
} from 'lucide-react';
import { 
  getAppointments, 
  bookNewAppointment, 
  cancelAppointment, 
  type AppointmentRecord 
} from '../../../services/sanctuaryDbService';

interface AppointmentsSectionProps {
  user?: { id?: string; email?: string; name?: string } | null;
}

export const AppointmentsSection: React.FC<AppointmentsSectionProps> = ({ user }) => {
  const userId = user?.id || '00000000-0000-0000-0000-000000000001';

  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('Personal Mindfulness Check-in');
  const [providerName, setProviderName] = useState<string>('Dr. Maya Patel');
  const [providerRole, setProviderRole] = useState<string>('Licensed Wellness Counselor');
  const [sessionDate, setSessionDate] = useState<string>('Friday, 4:00 PM');
  const [sessionTime, setSessionTime] = useState<string>('04:00 PM');
  const [sessionType, setSessionType] = useState<'therapy' | 'meditation_circle' | 'coaching' | 'checkin'>('therapy');
  const [notes, setNotes] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string>('');

  useEffect(() => {
    getAppointments(userId).then(a => setAppointments(a));
  }, [userId]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await bookNewAppointment(userId, {
      title,
      providerName,
      providerRole,
      date: sessionDate,
      time: sessionTime,
      type: sessionType,
      notes
    });
    setAppointments(updated);
    setShowModal(false);
    setToastMsg('Your wellness session has been successfully booked!');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      const updated = await cancelAppointment(userId, id);
      setAppointments(updated);
      setToastMsg('Appointment cancelled.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#eaf4eb] via-[#f2f7f9] to-[#faeee7] p-6 rounded-3xl border border-[#d8e8dc] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#2D6A4F]/20 text-[#2D6A4F] text-xs font-bold">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Sanctuary Calendar & Care Sessions</span>
          </div>
          <h2 className="text-2xl font-black text-[#1B4332] tracking-tight">
            Your Scheduled Support & Circles
          </h2>
          <p className="text-xs text-slate-600 max-w-xl">
            Coordinate virtual therapy check-ins, group breathwork circles, and one-on-one wellness consultations in a secure, confidential space.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Session</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#d8e8dc] text-[#1B4332] text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Appointments List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5ebe6] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-[#2D6A4F]" />
            <span>Upcoming Care Sessions ({appointments.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            Confidential Video Sessions
          </span>
        </div>

        {appointments.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">
            No upcoming appointments scheduled. Book a session to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {appointments.map(apt => (
              <div
                key={apt.id}
                className="p-5 rounded-2xl bg-[#fafcfb] border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#2D6A4F]/40 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2D6A4F] font-bold text-[10px] uppercase">
                      {apt.type.replace('_', ' ')}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{apt.title}</h4>
                  </div>

                  <div className="text-slate-600 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{apt.provider_name} • <span className="text-slate-400">{apt.provider_role}</span></span>
                  </div>

                  {apt.notes && (
                    <p className="text-slate-500 italic text-[11px]">
                      "{apt.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-black text-slate-800 text-xs flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>{apt.appointment_time}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{apt.appointment_date}</span>
                  </div>

                  <a
                    href={apt.meeting_link || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Room</span>
                  </a>

                  <button
                    onClick={() => handleCancel(apt.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                    title="Cancel Appointment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#1B4332]">Book a Care Session</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Provider / Facilitator</label>
                  <input
                    type="text"
                    required
                    value={providerName}
                    onChange={e => setProviderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role / Specialization</label>
                  <input
                    type="text"
                    value={providerRole}
                    onChange={e => setProviderRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Day / Date</label>
                  <input
                    type="text"
                    required
                    value={sessionDate}
                    onChange={e => setSessionDate(e.target.value)}
                    placeholder="e.g. Next Monday"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={sessionTime}
                    onChange={e => setSessionTime(e.target.value)}
                    placeholder="e.g. 11:00 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Type</label>
                <select
                  value={sessionType}
                  onChange={e => setSessionType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#2D6A4F]"
                >
                  <option value="therapy">1-on-1 Therapy Consultation</option>
                  <option value="meditation_circle">Group Meditation Circle</option>
                  <option value="coaching">Stress Resilience Coaching</option>
                  <option value="checkin">Quick Emotional Check-in</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Personal Notes (Confidential)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional notes or goals for this session..."
                  className="w-full p-2.5 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#2D6A4F] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppointmentsSection;
