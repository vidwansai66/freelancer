/**
 * Database Module (Zero-Cost Architecture Migration)
 * MongoDB & Mongoose dependencies have been completely removed.
 */

export const isDbConnected = (): boolean => true;

export const connectDB = async (): Promise<void> => {
  // No-op: Zero-Cost Architecture does not require a database connection.
  return Promise.resolve();
};
