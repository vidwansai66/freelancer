import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { randomUUID } from 'crypto';
import { studioSettingsData } from '../data/content';
import { overlaps, canClientChange, validDate } from '../utils/bookingRules';
import { newToken, hashToken } from '../utils/security';
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface LocalAppointment {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceType: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  meetingLink?: string;
  notes?: string;
  manageToken: string;
  manageTokenHash?: string;
  timeZone?: string;
  createdAt: string;
  updatedAt?: string;
}

const APPOINTMENTS_FILE = path.join(os.tmpdir(), 'wp_appointments.json');

// Initial seed appointments so calendar and dashboards are immediately functional
const getInitialSeedAppointments = (): LocalAppointment[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  const d1 = tomorrow.toISOString().slice(0, 10);
  const d2 = dayAfter.toISOString().slice(0, 10);

  return [
    {
      _id: 'apt-sample-01',
      clientName: 'Rahul Sharma',
      clientEmail: 'rahul.sharma@example.com',
      clientPhone: '+91 98765 43210',
      serviceType: 'Discovery Consultation',
      appointmentDate: d1,
      startTime: '10:00',
      endTime: '10:30',
      status: 'confirmed',
      meetingLink: 'https://meet.google.com/stw-rshm-call',
      notes: 'Interested in business portfolio website with SEO setup.',
      manageToken: 'token-sample-rahul-001',
      manageTokenHash: hashToken('token-sample-rahul-001'),
      timeZone: studioSettingsData.timeZone || 'Asia/Kolkata',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'apt-sample-02',
      clientName: 'Priya Patel',
      clientEmail: 'priya.patel@example.com',
      clientPhone: '+91 98111 22334',
      serviceType: 'Architecture & Technical Review',
      appointmentDate: d2,
      startTime: '14:30',
      endTime: '15:00',
      status: 'confirmed',
      meetingLink: 'https://meet.google.com/stw-ppat-meet',
      notes: 'E-commerce platform architecture and payment gateway integration.',
      manageToken: 'token-sample-priya-002',
      manageTokenHash: hashToken('token-sample-priya-002'),
      timeZone: studioSettingsData.timeZone || 'Asia/Kolkata',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

let inMemoryAppointments: LocalAppointment[] = [];

// Load persisted appointments from file if available, otherwise initialize with seed
const loadAppointments = (): LocalAppointment[] => {
  if (inMemoryAppointments.length > 0) {
    return inMemoryAppointments;
  }
  try {
    if (fs.existsSync(APPOINTMENTS_FILE)) {
      const data = fs.readFileSync(APPOINTMENTS_FILE, 'utf-8');
      inMemoryAppointments = JSON.parse(data);
      if (Array.isArray(inMemoryAppointments) && inMemoryAppointments.length > 0) {
        return inMemoryAppointments;
      }
    }
  } catch {
    // Fall back to memory on file read errors
  }
  inMemoryAppointments = getInitialSeedAppointments();
  persistAppointments();
  return inMemoryAppointments;
};

const persistAppointments = (): void => {
  try {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(inMemoryAppointments, null, 2), 'utf-8');
  } catch {
    // Ignore disk write errors in locked environments
  }
};

// Exported getter for other controllers (e.g. dashboardController)
export const getAllAppointments = (): LocalAppointment[] => {
  return [...loadAppointments()];
};

// Compute available 30-minute consultation slots within studio business hours,
// accurately excluding slots reserved by confirmed/pending appointments
export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;

    if (!date || typeof date !== 'string' || !validDate(date)) {
      sendError(res, 'A valid date query parameter in YYYY-MM-DD format is required.', 400);
      return;
    }

    const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay(); // 0 is Sunday, 6 is Saturday
    // Business hours: Monday through Friday (1 to 5)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      sendSuccess(res, { date, slots: [] }, 'No consultation slots available on weekends.');
      return;
    }

    const all = loadAppointments();
    const bookedOnDate = all.filter(
      (a) => a.appointmentDate === date && ['pending', 'confirmed'].includes(a.status),
    );

    // Default working hours: 09:00 to 18:00 (30-minute increments)
    const startHour = 9;
    const endHour = 18;
    const slots: Array<{ startTime: string; endTime: string; isAvailable: boolean }> = [];

    const todayStr = new Date().toISOString().slice(0, 10);
    const nowMinutes = new Date().getUTCHours() * 60 + new Date().getUTCMinutes();

    for (let h = startHour; h < endHour; h++) {
      const hStr = h.toString().padStart(2, '0');
      const nextHStr = (h + 1).toString().padStart(2, '0');

      const s1 = `${hStr}:00`;
      const e1 = `${hStr}:30`;
      const s2 = `${hStr}:30`;
      const e2 = `${nextHStr}:00`;

      // Check slot 1
      const isPast1 = date < todayStr || (date === todayStr && h * 60 < nowMinutes + 15);
      const isBooked1 = bookedOnDate.some((b) => overlaps(s1, e1, b.startTime, b.endTime));
      slots.push({
        startTime: s1,
        endTime: e1,
        isAvailable: !isPast1 && !isBooked1,
      });

      // Check slot 2
      const isPast2 = date < todayStr || (date === todayStr && (h * 60 + 30) < nowMinutes + 15);
      const isBooked2 = bookedOnDate.some((b) => overlaps(s2, e2, b.startTime, b.endTime));
      slots.push({
        startTime: s2,
        endTime: e2,
        isAvailable: !isPast2 && !isBooked2,
      });
    }

    sendSuccess(res, { date, slots }, 'Available appointment slots retrieved.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const bookAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      serviceType,
      appointmentDate,
      startTime,
      endTime,
      notes,
      meetingLink: providedMeetingLink,
    } = req.body;

    if (!clientName || !clientEmail || !appointmentDate || !startTime || !endTime) {
      sendError(res, 'Client name, email, date, start time, and end time are required.', 400);
      return;
    }

    if (!validDate(appointmentDate)) {
      sendError(res, 'Invalid appointment date format. Please use YYYY-MM-DD.', 400);
      return;
    }

    const all = loadAppointments();

    // Check for conflicting bookings in the same slot
    const hasConflict = all.some(
      (a) =>
        a.appointmentDate === appointmentDate &&
        ['pending', 'confirmed'].includes(a.status) &&
        overlaps(startTime, endTime, a.startTime, a.endTime),
    );

    if (hasConflict) {
      sendError(
        res,
        'The selected slot is no longer available. Please select another time.',
        409,
      );
      return;
    }

    const localId = `apt-${randomUUID().slice(0, 8)}`;
    const manageToken = newToken();
    const generatedMeetingLink =
      providedMeetingLink ||
      `https://meet.google.com/stw-${randomUUID().slice(0, 4)}-${randomUUID().slice(0, 4)}`;

    const newAppointment: LocalAppointment = {
      _id: localId,
      clientName: clientName.trim(),
      clientEmail: clientEmail.toLowerCase().trim(),
      clientPhone: clientPhone ? clientPhone.trim() : '',
      serviceType: serviceType || 'General Consultation',
      appointmentDate,
      startTime,
      endTime,
      status: 'confirmed',
      meetingLink: generatedMeetingLink,
      notes: notes ? notes.trim() : '',
      manageToken,
      manageTokenHash: hashToken(manageToken),
      timeZone: studioSettingsData.timeZone || 'Asia/Kolkata',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    all.push(newAppointment);
    inMemoryAppointments = all;
    persistAppointments();

    const whatsappText = encodeURIComponent(
      `Hello Teja Web Studio! I scheduled a consultation for ${appointmentDate} at ${startTime} regarding ${newAppointment.serviceType}. My name is ${newAppointment.clientName}.`,
    );
    const whatsappUrl = `https://wa.me/${studioSettingsData.whatsappNumber}?text=${whatsappText}`;

    sendSuccess(
      res,
      {
        ...newAppointment,
        id: localId,
        manageToken,
        meetingLink: generatedMeetingLink,
        appointment: newAppointment,
        whatsappConnectUrl: whatsappUrl,
      },
      'Appointment booked successfully! You can also connect directly via WhatsApp.',
      201,
    );
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const manageAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, action = 'view', appointmentDate, startTime, endTime } = req.body;

    if (!token) {
      sendError(res, 'Management token is required.', 400);
      return;
    }

    const all = loadAppointments();
    const tokenHash = hashToken(token);
    const appointment = all.find(
      (a) => a.manageToken === token || a.manageTokenHash === tokenHash,
    );

    if (!appointment) {
      sendError(res, 'Appointment not found or management token is invalid.', 404);
      return;
    }

    const studioTz = appointment.timeZone || studioSettingsData.timeZone || 'Asia/Kolkata';
    const cancellationHours = studioSettingsData.cancellationHours ?? 24;

    // View Action
    if (action === 'view') {
      sendSuccess(
        res,
        {
          ...appointment,
          timeZone: studioTz,
          cancellationHours,
        },
        'Appointment retrieved.',
      );
      return;
    }

    // Cancellation Action
    if (action === 'cancel') {
      appointment.status = 'cancelled';
      appointment.updatedAt = new Date().toISOString();
      persistAppointments();

      sendSuccess(
        res,
        {
          ...appointment,
          timeZone: studioTz,
          cancellationHours,
        },
        'Appointment cancelled successfully.',
      );
      return;
    }

    // Reschedule Action
    if (action === 'reschedule') {
      if (!appointmentDate || !startTime || !endTime) {
        sendError(res, 'New appointment date, start time, and end time are required.', 400);
        return;
      }

      if (!validDate(appointmentDate)) {
        sendError(res, 'Invalid appointment date format.', 400);
        return;
      }

      // Check client change notice policy
      const canChange = canClientChange(
        appointment.appointmentDate,
        appointment.startTime,
        cancellationHours,
        studioTz,
      );

      if (!canChange && appointment.status !== 'cancelled') {
        sendError(
          res,
          `Changes must be made more than ${cancellationHours} hours before the appointment.`,
          409,
        );
        return;
      }

      // Check if new slot conflicts with another appointment
      const conflict = all.some(
        (a) =>
          a._id !== appointment._id &&
          a.appointmentDate === appointmentDate &&
          ['pending', 'confirmed'].includes(a.status) &&
          overlaps(startTime, endTime, a.startTime, a.endTime),
      );

      if (conflict) {
        sendError(
          res,
          'The newly selected slot is already booked. Please choose another time.',
          409,
        );
        return;
      }

      appointment.appointmentDate = appointmentDate;
      appointment.startTime = startTime;
      appointment.endTime = endTime;
      appointment.status = 'confirmed';
      appointment.updatedAt = new Date().toISOString();
      persistAppointments();

      sendSuccess(
        res,
        {
          ...appointment,
          timeZone: studioTz,
          cancellationHours,
        },
        'Appointment rescheduled successfully.',
      );
      return;
    }

    sendError(res, 'Unknown management action requested.', 400);
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const rotateAppointmentCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const all = loadAppointments();
    const appointment = all.find((a) => a._id === id);

    if (!appointment) {
      sendError(res, 'Appointment not found.', 404);
      return;
    }

    const token = newToken();
    appointment.manageToken = token;
    appointment.manageTokenHash = hashToken(token);
    appointment.updatedAt = new Date().toISOString();
    persistAppointments();

    sendSuccess(res, { token }, 'Management code rotated.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, date, startDate, endDate, search, page = '1', limit = '20' } = req.query;

    let list = loadAppointments();

    if (status && status !== 'all') {
      list = list.filter((a) => a.status === status);
    }
    if (date) {
      list = list.filter((a) => a.appointmentDate === date);
    }
    if (startDate) {
      list = list.filter((a) => a.appointmentDate >= String(startDate));
    }
    if (endDate) {
      list = list.filter((a) => a.appointmentDate <= String(endDate));
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (a) =>
          a.clientName.toLowerCase().includes(q) ||
          a.clientEmail.toLowerCase().includes(q) ||
          a.serviceType.toLowerCase().includes(q),
      );
    }

    // Sort chronologically: upcoming dates first, then by start time
    list.sort((a, b) => {
      const cmp = a.appointmentDate.localeCompare(b.appointmentDate);
      if (cmp !== 0) return cmp;
      return a.startTime.localeCompare(b.startTime);
    });

    const total = list.length;
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, parseInt(String(limit), 10));
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = list.slice(startIndex, startIndex + limitNum);

    sendSuccess(res, paginated, 'Appointments retrieved successfully.', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getAppointmentsAdmin = getAppointments;

export const getAppointmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const all = loadAppointments();
    const appointment = all.find((a) => a._id === id);

    if (!appointment) {
      sendError(res, 'Appointment not found.', 404);
      return;
    }
    sendSuccess(res, appointment, 'Appointment retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const all = loadAppointments();
    const appointment = all.find((a) => a._id === id);

    if (!appointment) {
      sendError(res, 'Appointment not found.', 404);
      return;
    }

    const { status, notes, meetingLink, appointmentDate, startTime, endTime } = req.body;

    // Check slot collision if rescheduling to a new slot
    if (
      (appointmentDate && appointmentDate !== appointment.appointmentDate) ||
      (startTime && startTime !== appointment.startTime)
    ) {
      const checkDate = appointmentDate || appointment.appointmentDate;
      const checkStart = startTime || appointment.startTime;
      const checkEnd = endTime || appointment.endTime;

      const hasConflict = all.some(
        (a) =>
          a._id !== id &&
          a.appointmentDate === checkDate &&
          ['pending', 'confirmed'].includes(a.status) &&
          overlaps(checkStart, checkEnd, a.startTime, a.endTime),
      );

      if (hasConflict) {
        sendError(res, 'Conflicting appointment: this slot is already booked.', 409);
        return;
      }
    }

    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    if (meetingLink !== undefined) appointment.meetingLink = meetingLink;
    if (appointmentDate) appointment.appointmentDate = appointmentDate;
    if (startTime) appointment.startTime = startTime;
    if (endTime) appointment.endTime = endTime;
    appointment.updatedAt = new Date().toISOString();

    persistAppointments();

    sendSuccess(res, appointment, 'Appointment updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const all = loadAppointments();
    const appointment = all.find((a) => a._id === id);

    if (!appointment) {
      sendError(res, 'Appointment not found.', 404);
      return;
    }

    appointment.status = 'cancelled';
    appointment.updatedAt = new Date().toISOString();
    persistAppointments();

    sendSuccess(res, appointment, 'Appointment cancelled successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
