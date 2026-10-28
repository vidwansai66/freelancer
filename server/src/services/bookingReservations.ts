export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export const getAvailableSlotsForDate = async (date: string): Promise<TimeSlot[]> => {
  const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return [];

  const slots: TimeSlot[] = [];
  for (let h = 9; h < 18; h++) {
    const hStr = h.toString().padStart(2, '0');
    const nextHStr = (h + 1).toString().padStart(2, '0');
    slots.push({ startTime: `${hStr}:00`, endTime: `${hStr}:30`, isAvailable: true });
    slots.push({ startTime: `${hStr}:30`, endTime: `${nextHStr}:00`, isAvailable: true });
  }
  return slots;
};

export const bookSlotAtomically = async () => {};
export const reserveAppointment = async () => {};
export const initializeReservations = async () => {};
