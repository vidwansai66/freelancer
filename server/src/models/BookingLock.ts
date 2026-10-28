export interface IBookingLock {
  id: string;
  slotKey: string;
  lockedAt: Date;
  expiresAt: Date;
}
