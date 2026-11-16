import { QueryFailedError } from 'typeorm';

export function isForeignKeyNotFound(error: unknown): boolean {
  const notQueryFail = !(error instanceof QueryFailedError);
  if (notQueryFail) {
    return false;
  }

  const errorCode = (error.driverError as { code?: string }).code;
  const isForeignKeyNotFoundFailure = errorCode === 'ER_NO_REFERENCED_ROW_2';
  return isForeignKeyNotFoundFailure;
}
