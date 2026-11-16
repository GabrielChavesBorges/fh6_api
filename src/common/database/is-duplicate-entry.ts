import { QueryFailedError } from 'typeorm';

export function isDuplicateEntry(error: unknown): boolean {
  const notQueryFail = !(error instanceof QueryFailedError);
  if (notQueryFail) {
    return false;
  }

  const isDuplicateFailure = (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY';
  return isDuplicateFailure;
}
