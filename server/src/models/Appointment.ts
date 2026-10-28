export interface IAppointment {
  id: string;
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
  zohoLeadId?: string;
  manageToken: string;
  manageTokenHash?: string;
  timeZone?: string;
  createdAt: Date;
  updatedAt?: Date;
}

