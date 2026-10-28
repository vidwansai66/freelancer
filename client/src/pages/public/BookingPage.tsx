import { useSettings } from '../../context/SettingsContext';
import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  Download,
  ArrowRight,
  User,
} from 'lucide-react';
import { appointmentsApi } from '../../services/api';
import { TimeSlot } from '../../types';

export const BookingPage: React.FC = () => {
  const { settings } = useSettings();
  const [requestKey, setRequestKey] = useState(() => crypto.randomUUID());
  const [clientBookings, setClientBookings] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('client_recent_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Service selection
  const serviceOptions = [
    {
      title: 'Discovery Consultation',
      duration: '30 mins',
      desc: 'Discuss your business needs, goals, and ideal website structure.',
    },
    {
      title: 'Architecture & Technical Review',
      duration: '45 mins',
      desc: 'Deep dive into tech stack, database models, and integrations.',
    },
    {
      title: 'Website Launch Kickoff',
      duration: '30 mins',
      desc: 'Pre-launch alignment on domain, hosting DNS, and analytics tags.',
    },
  ];

  const [selectedService, setSelectedService] = useState(serviceOptions[0].title);

  // Date selection (default to tomorrow or next business day)
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowStr());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Form details
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Status
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch slots whenever selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setSlotsLoading(true);
      setSelectedSlot(null);
      setErrorMessage(null);

      appointmentsApi
        .getAvailableSlots(selectedDate)
        .then((data) => {
          setAvailableSlots(data.slots || []);
        })
        .catch((err) => {
          setErrorMessage(err.response?.data?.message || 'Failed to load available time slots.');
          setAvailableSlots([]);
        })
        .finally(() => setSlotsLoading(false));
    }
  }, [selectedDate]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedSlot) {
      setErrorMessage('Please select an available time slot.');
      return;
    }

    if (!clientName.trim() || !clientEmail.trim()) {
      setErrorMessage('Please provide your name and email address.');
      return;
    }

    setBookingLoading(true);
    try {
      const idempotencyKey = requestKey;
      const res = await appointmentsApi.book({
        clientName: clientName.trim(),
        clientEmail: clientEmail.toLowerCase().trim(),
        clientPhone: clientPhone.trim(),
        serviceType: selectedService,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: notes.trim(),
        idempotencyKey,
      });

      // Normalize appointment properties regardless of wrapper
      const appointment = {
        _id: res._id || res.id || res.appointment?._id,
        clientName: res.clientName || res.appointment?.clientName || clientName.trim(),
        clientEmail: res.clientEmail || res.appointment?.clientEmail || clientEmail.trim(),
        clientPhone: res.clientPhone || res.appointment?.clientPhone || clientPhone.trim(),
        serviceType: res.serviceType || res.appointment?.serviceType || selectedService,
        appointmentDate: res.appointmentDate || res.appointment?.appointmentDate || selectedDate,
        startTime: res.startTime || res.appointment?.startTime || selectedSlot.startTime,
        endTime: res.endTime || res.appointment?.endTime || selectedSlot.endTime,
        meetingLink:
          res.meetingLink ||
          res.appointment?.meetingLink ||
          'https://meet.google.com/stw-cons-call',
        manageToken: res.manageToken || res.appointment?.manageToken,
        status: res.status || res.appointment?.status || 'confirmed',
        notes: res.notes || res.appointment?.notes || notes.trim(),
        whatsappConnectUrl: res.whatsappConnectUrl,
      };

      setConfirmedBooking(appointment);

      // Save to client bookings array
      const updatedList = [
        appointment,
        ...clientBookings.filter((b) => b._id !== appointment._id),
      ];
      setClientBookings(updatedList);

      try {
        localStorage.setItem('client_recent_bookings', JSON.stringify(updatedList));
        const tokens: string[] = JSON.parse(
          localStorage.getItem('client_booking_tokens') || '[]',
        );
        if (appointment.manageToken && !tokens.includes(appointment.manageToken)) {
          tokens.unshift(appointment.manageToken);
          localStorage.setItem('client_booking_tokens', JSON.stringify(tokens));
        }
      } catch {
        // Ignore localStorage quota errors
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'The selected slot is no longer available. Please select another time.';
      setErrorMessage(errorMsg);

      // Refresh slots automatically to reflect the latest taken slots
      appointmentsApi.getAvailableSlots(selectedDate).then((data) => {
        setAvailableSlots(data.slots || []);
      });
      setSelectedSlot(null);
    } finally {
      setBookingLoading(false);
    }
  };

  // Generate downloadable .ics calendar file
  const downloadIcs = () => {
    if (!confirmedBooking) return;
    const { appointmentDate, startTime, endTime, serviceType, meetingLink } = confirmedBooking;
    const cleanDate = appointmentDate.replace(/-/g, '');
    const cleanStart = startTime.replace(':', '') + '00';
    const cleanEnd = endTime.replace(':', '') + '00';

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Teja Web Studio//Discovery Call//EN
BEGIN:VEVENT
SUMMARY:${serviceType} - Teja Web Studio
DESCRIPTION:Meeting link: ${meetingLink}
DTSTART;TZID=${settings.timeZone}:${cleanDate}T${cleanStart}
DTEND;TZID=${settings.timeZone}:${cleanDate}T${cleanEnd}
LOCATION:${meetingLink}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `consultation_${appointmentDate}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pt-32 pb-24">
      <p className="text-center text-sm mt-4">
        Times are shown in {settings.timeZone}. Cancel or reschedule more than{' '}
        {settings.cancellationHours} hours before your booking.
      </p>
      {confirmedBooking?.manageToken && (
        <div className="mx-auto max-w-xl p-6 break-all">
          <p>Save this private link to manage your booking:</p>
          <a
            href={`/manage-booking#${confirmedBooking.manageToken}`}
            className="text-primary underline"
          >
            {window.location.origin}/manage-booking#{confirmedBooking.manageToken}
          </a>
        </div>
      )}
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
            Live Scheduling
          </p>
          <h1 className="text-4xl font-bold md:text-5xl text-white">
            Book a 30-Min Discovery Call
          </h1>
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            Select a convenient date and time. Our calendar updates in real time to guarantee zero
            double bookings and instant confirmation.
          </p>
        </div>

        {confirmedBooking ? (
          /* ======================================================== */
          /* BOOKING CONFIRMED STATE                                  */
          /* ======================================================== */
          <div className="rounded-3xl border border-border bg-card p-8 md:p-14 text-center max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                Appointment Confirmed
              </span>
              <h2 className="text-3xl font-bold text-white mt-1">You're on the Calendar!</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Your booking is saved with the contact email{' '}
                <span className="text-white font-medium">{confirmedBooking.clientEmail}</span>.
              </p>
            </div>

            {/* Appointment Details Box */}
            <div className="rounded-2xl border border-border bg-secondary/50 p-6 text-left space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-border/60 pb-3">
                <span className="text-muted-foreground">Service:</span>
                <span className="text-white font-semibold">{confirmedBooking.serviceType}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-border/60 pb-3">
                <span className="text-muted-foreground">Date:</span>
                <span className="text-white font-semibold">{confirmedBooking.appointmentDate}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-border/60 pb-3">
                <span className="text-muted-foreground">Time Slot:</span>
                <span className="text-white font-semibold">
                  {confirmedBooking.startTime} – {confirmedBooking.endTime}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted-foreground">Meeting Link:</span>
                <a
                  href={confirmedBooking.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  <Video className="h-3.5 w-3.5" /> Open Google Meet
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button
                onClick={downloadIcs}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-6 py-2.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all"
              >
                <Download className="h-3.5 w-3.5" /> Add to Apple / Google Calendar (.ics)
              </button>
              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  setSelectedSlot(null);
                  setRequestKey(crypto.randomUUID());
                  setNotes('');
                  setErrorMessage(null);
                  if (selectedDate) {
                    appointmentsApi.getAvailableSlots(selectedDate).then((data) => {
                      setAvailableSlots(data.slots || []);
                    });
                  }
                }}
                className="rounded-full border border-border bg-card px-6 py-2.5 text-xs font-semibold text-muted-foreground hover:text-white"
              >
                Book another appointment
              </button>
            </div>

            {/* If client has multiple bookings booked in this session */}
            {clientBookings.length > 1 && (
              <div className="pt-6 border-t border-border/80 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    All Scheduled Consultations ({clientBookings.length})
                  </h4>
                  <a
                    href={`/manage-booking#${confirmedBooking.manageToken}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Manage Online →
                  </a>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {clientBookings.map((b, idx) => (
                    <div
                      key={b._id || idx}
                      className="rounded-xl border border-border bg-secondary/30 p-3.5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white truncate max-w-[150px]">
                          {b.serviceType}
                        </span>
                        <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-semibold capitalize">
                          {b.status || 'confirmed'}
                        </span>
                      </div>
                      <p className="text-muted-foreground font-mono text-[11px]">
                        {b.appointmentDate} · {b.startTime}–{b.endTime}
                      </p>
                      {b.meetingLink && (
                        <a
                          href={b.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                        >
                          <Video className="h-3 w-3" /> Video Link
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* BOOKING INTERACTIVE WIZARD                               */
          /* ======================================================== */
          <div className="grid gap-10 md:grid-cols-12 items-start">
            {/* Step 1 & 2: Service & Date (5 cols) */}
            <div className="md:col-span-5 space-y-6">
              {/* Service Selection */}
              <div className="rounded-3xl border border-border bg-card p-6 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  1. Select Consultation Type
                </h3>
                {serviceOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt.title}
                    onClick={() => setSelectedService(opt.title)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      selectedService === opt.title
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-border bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>{opt.title}</span>
                      <span className="text-[11px] font-normal text-primary">{opt.duration}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>

              {/* Date Picker */}
              <div className="rounded-3xl border border-border bg-card p-6 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" /> 2. Choose Appointment Date
                </h3>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
                />
                <p className="text-[11px] text-muted-foreground">
                  Available Mon–Fri, 9:00 AM – 6:00 PM. Weekends and past dates are unavailable.
                </p>
              </div>
            </div>

            {/* Step 3: Slots & Client Form (7 cols) */}
            <div className="md:col-span-7 rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> 3. Select an Open Slot for{' '}
                  {selectedDate}
                </h3>

                {errorMessage && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {slotsLoading ? (
                  <div className="py-10 text-center text-xs text-muted-foreground animate-pulse">
                    Checking real-time calendar availability...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="rounded-xl border border-border bg-secondary/30 p-6 text-center text-xs text-muted-foreground">
                    No open slots available for this date. Please pick another business day.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime;
                      return (
                        <button
                          type="button"
                          key={slot.startTime}
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-xl py-2 px-2 text-xs font-semibold transition-all border ${
                            !slot.isAvailable
                              ? 'opacity-30 border-border bg-secondary/20 cursor-not-allowed line-through text-muted-foreground'
                              : isSelected
                                ? 'bg-primary border-primary text-white shadow-glow'
                                : 'bg-secondary border-border text-foreground hover:border-primary/50 hover:bg-secondary/80'
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 4: Details Form */}
              <form onSubmit={handleBook} className="space-y-4 pt-6 border-t border-border">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> 4. Your Details
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      className="block text-[11px] text-muted-foreground mb-1"
                      htmlFor="BookingPage-field-0"
                    >
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={clientName}
                      id="BookingPage-field-0"
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-[11px] text-muted-foreground mb-1"
                      htmlFor="BookingPage-field-1"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@company.com"
                      value={clientEmail}
                      id="BookingPage-field-1"
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      className="block text-[11px] text-muted-foreground mb-1"
                      htmlFor="BookingPage-field-2"
                    >
                      Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={clientPhone}
                      id="BookingPage-field-2"
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-[11px] text-muted-foreground mb-1"
                      htmlFor="BookingPage-field-3"
                    >
                      Notes / Questions
                    </label>
                    <input
                      type="text"
                      placeholder="Interested in E-commerce rebuild"
                      value={notes}
                      id="BookingPage-field-3"
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedSlot || bookingLoading}
                  className="glow-card inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-xs font-semibold text-white shadow-glow hover:scale-[1.01] transition-all disabled:opacity-40"
                >
                  {bookingLoading ? (
                    <span>Securing Slot...</span>
                  ) : selectedSlot ? (
                    <>
                      Confirm Call for {selectedSlot.startTime}{' '}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    'Select a Time Slot Above to Continue'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
