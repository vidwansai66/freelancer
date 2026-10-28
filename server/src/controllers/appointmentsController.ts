import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { randomUUID } from 'crypto';
import { studioSettingsData } from '../data/content';

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
  notes?: string;
  manageToken: string;
  createdAt: string;
}

const inMemoryAppointments: LocalAppointment[] = [];

// Compute available 30-minute consultation slots within studio business hours
export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      sendError(res, 'A date query parameter in YYYY-MM-DD format is required.', 400);
      return;
    }

    const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay(); // 0 is Sunday, 6 is Saturday
    // Business hours: Monday through Friday (1 to 5)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      sendSuccess(res, { date, slots: [] }, 'No consultation slots available on weekends.');
      return;
    }

    // Default working hours: 09:00 to 18:00
    const startHour = 9;
    const endHour = 18;
    const slots: Array<{ startTime: string; endTime: string; isAvailable: boolean }> = [];

    for (let h = startHour; h < endHour; h++) {
      const hStr = h.toString().padStart(2, '0');
      const nextHStr = (h + 1).toString().padStart(2, '0');

      slots.push({
        startTime: `${hStr}:00`,
        endTime: `${hStr}:30`,
        isAvailable: true,
      });
      slots.push({
        startTime: `${hStr}:30`,
        endTime: `${nextHStr}:00`,
        isAvailable: true,
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
    } = req.body;

    if (!clientName || !clientEmail || !appointmentDate || !startTime || !endTime) {
      sendError(res, 'Client name, email, date, start time, and end time are required.', 400);
      return;
    }

    const localId = `apt-${randomUUID().slice(0, 8)}`;
    const manageToken = randomUUID();

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
      notes: notes ? notes.trim() : '',
      manageToken,
      createdAt: new Date().toISOString(),
    };

    inMemoryAppointments.push(newAppointment);

    const whatsappText = encodeURIComponent(
      `Hello Teja Web Studio! I scheduled a consultation for ${appointmentDate} at ${startTime} regarding ${newAppointment.serviceType}. My name is ${newAppointment.clientName}.`,
    );
    const whatsappUrl = `https://wa.me/${studioSettingsData.whatsappNumber}?text=${whatsappText}`;

    sendSuccess(
      res,
      {
        id: localId,
        manageToken,
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
    const { token } = req.body;
    const appointment = inMemoryAppointments.find((a) => a.manageToken === token);
    if (!appointment) {
      sendError(res, 'Appointment not found or management token is invalid.', 404);
      return;
    }
    sendSuccess(res, appointment, 'Appointment retrieved.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const rotateAppointmentCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = inMemoryAppointments.find((a) => a._id === id);
    if (!appointment) {
      sendError(res, 'Appointment not found.', 404);
      return;
    }
    appointment.manageToken = randomUUID();
    sendSuccess(res, { token: appointment.manageToken }, 'Management code rotated.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, date, page = '1', limit = '15' } = req.query;

    let list = [...inMemoryAppointments];
    if (status && status !== 'all') {
      list = list.filter((a) => a.status === status);
    }
    if (date) {
      list = list.filter((a) => a.appointmentDate === date);
    }

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
    const appointment = inMemoryAppointments.find((a) => a._id === id);
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
    const appointment = inMemoryAppointments.find((a) => a._id === id);
    if (!appointment) {
      sendError(res, 'Appointment not found.', 404);
      return;
    }

    const { status, notes } = req.body;
    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;

    sendSuccess(res, appointment, 'Appointment updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = inMemoryAppointments.find((a) => a._id === id);
    if (!appointment) {
      sendError(res, 'Appointment not found.', 404);
      return;
    }

    appointment.status = 'cancelled';
    sendSuccess(res, appointment, 'Appointment cancelled successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
