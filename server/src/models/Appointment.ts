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
  notes?: string;
  manageToken: string;
  createdAt: Date;
}
