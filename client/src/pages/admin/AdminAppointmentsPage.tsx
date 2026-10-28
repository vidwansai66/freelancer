import { api } from '../../services/api';
import { Field, fieldClass } from '../../components/common/Forms';
import { Pagination } from '../../components/common/Forms';
import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  XCircle,
  CheckCircle2,
  User,
  Phone,
  Mail,
  Filter,
} from 'lucide-react';
import { Appointment } from '../../types';
import { appointmentsApi } from '../../services/api';

export const AdminAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1),
    [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Edit / Reschedule state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [managementCode, setManagementCode] = useState('');
  const [newDate, setNewDate] = useState(''),
    [newTime, setNewTime] = useState(''),
    [editSlots, setEditSlots] = useState<any[]>([]);
  const [notesInput, setNotesInput] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const fetchAppointments = () => {
    setLoading(true);
    appointmentsApi
      .getAllAdmin({
        status: statusFilter === 'all' ? undefined : statusFilter,
        date: dateFilter || undefined,
        limit: 20,
        page,
      })
      .then((res) => {
        setAppointments(res.data || []);
        setPages(res.meta?.totalPages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter, page]);
  useEffect(() => {
    setPage(1);
  }, [statusFilter, dateFilter]);

  const openEdit = (app: Appointment) => {
    setSelectedAppointment(app);
    setManagementCode('');
    setNewDate(app.appointmentDate);
    setNewTime(app.startTime);
    appointmentsApi.getAvailableSlots(app.appointmentDate).then((data) => setEditSlots(data.slots));
    setMeetingLink(app.meetingLink || '');
    setStatusInput(app.status);
    setNotesInput(app.notes || '');
    setFeedback(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setSaveLoading(true);
    setFeedback(null);
    try {
      const updated = await appointmentsApi.update(selectedAppointment._id, {
        meetingLink: meetingLink.trim(),
        appointmentDate: newDate,
        startTime: newTime,
        endTime:
          editSlots.find((slot) => slot.startTime === newTime)?.endTime ||
          selectedAppointment.endTime,
        status: statusInput,
        notes: notesInput.trim(),
      });
      setFeedback({
        type: 'success',
        message: 'Meeting link and appointment details updated successfully!',
      });
      // Synchronize in local state immediately
      setAppointments((prev) =>
        prev.map((app) =>
          app._id === selectedAppointment._id ? { ...app, ...updated, meetingLink: meetingLink.trim() } : app,
        ),
      );
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message:
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to update appointment.',
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (
      window.confirm(
        'Cancel this appointment? This will send an automated cancellation notification email to the client.',
      )
    ) {
      try {
        await appointmentsApi.cancel(id);
        fetchAppointments();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Pagination page={page} totalPages={pages} onChange={setPage} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Appointments &amp; Discovery Calls</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage scheduled client consultations, update video meeting links, and manage calendar
            availability.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-glow'
                  : 'bg-secondary text-muted-foreground hover:text-white border border-border'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`rounded-2xl p-4 text-xs font-medium flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:opacity-80 ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Date Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary"
          />
        </div>
        {dateFilter && (
          <button
            onClick={() => setDateFilter('')}
            className="text-xs text-muted-foreground hover:text-white underline"
          >
            Clear Date Filter
          </button>
        )}
      </div>

      {/* Appointments List / Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-20 text-center text-xs text-muted-foreground">
            No appointments found for the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-white font-semibold uppercase tracking-wider text-[11px] border-b border-border">
                <tr>
                  <th className="py-3.5 px-5">Date &amp; Time</th>
                  <th className="py-3.5 px-5">Client Information</th>
                  <th className="py-3.5 px-5">Consultation Type</th>
                  <th className="py-3.5 px-5">Meeting Link</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((app) => (
                  <tr key={app._id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                        <span>{app.appointmentDate}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                        {app.startTime} – {app.endTime}
                      </p>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-bold text-white">{app.clientName}</p>
                      <p className="text-[11px] text-muted-foreground">{app.clientEmail}</p>
                      {app.clientPhone && (
                        <p className="text-[10px] text-primary">{app.clientPhone}</p>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-medium text-white">{app.serviceType}</p>
                      {app.notes && (
                        <p className="text-[11px] text-muted-foreground italic truncate max-w-xs">
                          {app.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      {app.meetingLink ? (
                        <a
                          href={app.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                        >
                          <Video className="h-3.5 w-3.5" /> Join Link
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">Not generated</span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                          app.status === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : app.status === 'cancelled'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(app)}
                        className="rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-white px-2.5 py-1 text-[11px] font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      {app.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(app._id)}
                          className="rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-2.5 py-1 text-[11px] font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Appointment Modal */}
      {selectedAppointment && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit record"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Manage Call Details</h3>
            <p className="text-xs text-muted-foreground mb-4">
              {selectedAppointment.clientName} • {selectedAppointment.appointmentDate} (
              {selectedAppointment.startTime})
            </p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <button
                type="button"
                className="underline"
                onClick={async () => {
                  const response = await api.post(
                    `/appointments/${selectedAppointment._id}/management-code`,
                  );
                  setManagementCode(response.data.data.token);
                }}
              >
                Generate private client management link
              </button>
              {managementCode && (
                <a
                  className="block text-primary underline break-all"
                  href={`/manage-booking#${managementCode}`}
                >
                  {window.location.origin}/manage-booking#{managementCode}
                </a>
              )}
              <Field
                label="Appointment date"
                type="date"
                value={newDate}
                onChange={(value) => {
                  setNewDate(value);
                  setNewTime('');
                  appointmentsApi.getAvailableSlots(value).then((data) => setEditSlots(data.slots));
                }}
              />
              <label htmlFor="edit-time">Appointment time</label>
              <select
                id="edit-time"
                className={fieldClass}
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
              >
                <option value="">Select a time</option>
                {editSlots
                  .filter(
                    (slot) =>
                      slot.isAvailable ||
                      (newDate === selectedAppointment?.appointmentDate &&
                        slot.startTime === selectedAppointment?.startTime),
                  )
                  .map((slot) => (
                    <option key={slot.startTime} value={slot.startTime}>
                      {slot.startTime}–{slot.endTime}
                    </option>
                  ))}
              </select>
              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminAppointmentsPage-field-0"
                >
                  Status
                </label>
                <select
                  value={statusInput}
                  id="AdminAppointmentsPage-field-0"
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminAppointmentsPage-field-1"
                >
                  Google Meet / Video Link
                </label>
                <input
                  type="url"
                  value={meetingLink}
                  id="AdminAppointmentsPage-field-1"
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abc-123"
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-white mb-1"
                  htmlFor="AdminAppointmentsPage-field-2"
                >
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={notesInput}
                  id="AdminAppointmentsPage-field-2"
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary p-3 text-xs text-white focus:outline-none focus:border-primary resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  data-dialog-close
                  aria-label="Close"
                  onClick={() => setSelectedAppointment(null)}
                  className="rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold text-muted-foreground hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="glow-card rounded-full bg-primary px-6 py-2 text-xs font-semibold text-white shadow-glow hover:scale-105 transition-all disabled:opacity-50"
                >
                  {saveLoading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
