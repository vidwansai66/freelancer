import { useState, useEffect } from 'react';
import { api, appointmentsApi } from '../../services/api';
import { Field, fieldClass } from '../../components/common/Forms';
import { Video, Calendar, Clock, CheckCircle2, AlertCircle, RefreshCw, XCircle, Copy, Check } from 'lucide-react';

export function ManageBookingPage() {
  const [token, setToken] = useState(() => window.location.hash.slice(1));
  const [savedTokens, setSavedTokens] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('client_booking_tokens');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [booking, setBooking] = useState<any>(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<any[]>([]);
  const [start, setStart] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Available slots for reschedule
  useEffect(() => {
    setStart('');
    if (date) {
      appointmentsApi
        .getAvailableSlots(date)
        .then((data) => setSlots((data.slots || []).filter((slot: any) => slot.isAvailable)))
        .catch(() => setSlots([]));
    }
  }, [date]);

  // Load booking by token automatically if provided in hash or single saved token
  useEffect(() => {
    const activeToken = token || (savedTokens.length === 1 ? savedTokens[0] : '');
    if (activeToken) {
      fetchBooking(activeToken);
    }
  }, [token]);

  const fetchBooking = async (targetToken: string) => {
    if (!targetToken) return;
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const response = await api.post('/appointments/manage', {
        token: targetToken,
        action: 'view',
      });
      const data = response.data.data;
      setBooking(data);
      setToken(targetToken);
      window.location.hash = targetToken;

      // Save token to localStorage list
      if (!savedTokens.includes(targetToken)) {
        const nextTokens = [targetToken, ...savedTokens];
        setSavedTokens(nextTokens);
        try {
          localStorage.setItem('client_booking_tokens', JSON.stringify(nextTokens));
        } catch {}
      }
    } catch (err: any) {
      setBooking(null);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Unable to find booking. Please check your private management code.',
      );
    } finally {
      setLoading(false);
    }
  };

  const manage = async (action: string) => {
    setError('');
    setSuccessMessage('');
    const slot = slots.find((value) => value.startTime === start);
    setLoading(true);
    try {
      const response = await api.post('/appointments/manage', {
        token,
        action,
        ...(action === 'reschedule' && slot
          ? { appointmentDate: date, startTime: slot.startTime, endTime: slot.endTime }
          : {}),
      });
      const data = response.data.data;
      setBooking(data);
      if (action === 'reschedule') {
        setSuccessMessage('Appointment rescheduled successfully! Check your updated time below.');
        setDate('');
        setStart('');
      } else if (action === 'cancel') {
        setSuccessMessage('Appointment has been cancelled.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Unable to update booking.');
    } finally {
      setLoading(false);
    }
  };

  const copyMeetingLink = () => {
    if (!booking?.meetingLink) return;
    navigator.clipboard.writeText(booking.meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 pt-32 pb-24 space-y-8 animate-fade-in">
      <div className="text-center max-w-lg mx-auto">
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Client Portal
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">Manage Your Consultation</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-2">
          View appointment status, join live video meetings, or reschedule your discovery call.
        </p>
      </div>

      {/* Switch between saved client bookings if multiple exist */}
      {savedTokens.length > 1 && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <p className="text-xs font-bold text-white uppercase tracking-wider">
            Your Saved Consultations ({savedTokens.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {savedTokens.map((t, index) => (
              <button
                key={t}
                onClick={() => fetchBooking(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  token === t
                    ? 'bg-primary text-white font-semibold shadow-glow'
                    : 'bg-secondary text-muted-foreground hover:text-white border border-border'
                }`}
              >
                Call #{index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Token Search Form */}
      <form
        className="rounded-2xl border border-border bg-card p-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          fetchBooking(token.trim());
        }}
      >
        <Field
          label="Private consultation code"
          placeholder="Paste the code from your confirmation"
          value={token}
          onChange={setToken}
          required
        />
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition disabled:opacity-50"
          >
            {loading ? 'Finding call...' : 'Find Consultation'}
          </button>
          {booking && (
            <button
              type="button"
              onClick={() => fetchBooking(token)}
              className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Refresh status
            </button>
          )}
        </div>
      </form>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {booking && (
        <section className="space-y-5 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
            <div>
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                Consultation Details
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">{booking.serviceType}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Booked for <span className="text-white font-medium">{booking.clientName}</span> ({booking.clientEmail})
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize self-start sm:self-auto ${
                booking.status === 'confirmed'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : booking.status === 'cancelled'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-secondary text-muted-foreground'
              }`}
            >
              {booking.status}
            </span>
          </div>

          {/* Date & Time display */}
          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-2xl border border-border bg-secondary/30 p-4 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-bold text-white text-sm">{booking.appointmentDate}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/30 p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-muted-foreground">Time Slot</p>
                <p className="font-bold text-white text-sm">
                  {booking.startTime} – {booking.endTime} ({booking.timeZone || 'Asia/Kolkata'})
                </p>
              </div>
            </div>
          </div>

          {/* Video Meeting Link Display - Always synchronized with Admin edits */}
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Video className="h-4 w-4" /> Live Video Consultation
              </div>
              {booking.meetingLink && (
                <button
                  type="button"
                  onClick={copyMeetingLink}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-white"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy link'}
                </button>
              )}
            </div>

            {booking.meetingLink ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="truncate">
                  <p className="text-xs text-muted-foreground">Meeting URL:</p>
                  <a
                    href={booking.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white hover:text-primary font-mono font-medium underline truncate block"
                  >
                    {booking.meetingLink}
                  </a>
                </div>
                <a
                  href={booking.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary/90 transition shadow-glow whitespace-nowrap"
                >
                  <Video className="h-3.5 w-3.5" /> Join Meeting Now
                </a>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                The video meeting link will be updated here shortly before your appointment.
              </p>
            )}
          </div>

          {booking.notes && (
            <div className="rounded-2xl border border-border bg-secondary/20 p-4 text-xs">
              <p className="text-muted-foreground font-semibold">Notes from booking:</p>
              <p className="text-white mt-1 italic">{booking.notes}</p>
            </div>
          )}

          {/* Policy Information */}
          <p className="text-[11px] text-muted-foreground">
            Changes and cancellations must be made more than {booking.cancellationHours || 24} hours before your scheduled appointment.
          </p>

          {/* Reschedule & Cancel Controls */}
          {['pending', 'confirmed'].includes(booking.status) && (
            <div className="space-y-4 pt-4 border-t border-border/80">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Reschedule Appointment
              </h3>
              <Field type="date" label="New appointment date" value={date} onChange={setDate} />
              
              {date && (
                <div>
                  <label htmlFor="manage-slot" className="block text-xs font-medium text-white mb-1">
                    Select Available Time Slot
                  </label>
                  <select
                    id="manage-slot"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Choose an open slot</option>
                    {slots.map((slot) => (
                      <option key={slot.startTime} value={slot.startTime}>
                        {slot.startTime} – {slot.endTime}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  disabled={!start || loading}
                  className="w-full sm:w-auto rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white hover:bg-primary/90 transition disabled:opacity-40"
                  onClick={() => manage('reschedule')}
                >
                  Confirm Reschedule
                </button>

                <button
                  type="button"
                  disabled={loading}
                  className="w-full sm:w-auto text-xs text-rose-400 hover:text-rose-300 underline py-2 flex items-center justify-center gap-1"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel this discovery call?')) {
                      manage('cancel');
                    }
                  }}
                >
                  <XCircle className="h-3.5 w-3.5" /> Cancel Booking
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
export default ManageBookingPage;
