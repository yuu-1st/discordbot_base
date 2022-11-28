/* eslint-disable max-classes-per-file */

import CustomBaseError from './CustomBaseError.js';

export class WrappedError extends CustomBaseError {
  protected wrappedError: Error | undefined;

  constructor(errorCode: number, error: Error, message?: string) {
    super(3000 + errorCode, 'Wrapped', message ?? error.message);
    this.wrappedError = error;
  }

  errorObject = () => this.wrappedError;

  errorName = () => this.wrappedError?.name;

  errorCause = () => this.wrappedError?.cause;

  stackTrace = () => this.wrappedError?.stack;
}

export class SendFailedWrappedError extends WrappedError {
  /** WrappedError: 送信に失敗しました。 */
  constructor(error: Error, message?: string) {
    super(1, error, message);
  }
}

export class LoadFailedWrappedError extends WrappedError {
  /** WrappedError: 読み込みに失敗しました。 */
  constructor(error: Error, message?: string) {
    super(1, error, message);
  }
}
