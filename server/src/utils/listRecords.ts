import { Request, Response } from 'express';
import { sendSuccess } from './apiResponse';

export const listRecords = async (
  _req: Request,
  res: Response,
  data: any[] = [],
) => {
  sendSuccess(res, data, 'Records retrieved.', 200, {
    page: 1,
    limit: data.length,
    total: data.length,
    totalPages: 1,
  });
};
