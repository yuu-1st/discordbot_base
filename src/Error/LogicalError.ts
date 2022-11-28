/* eslint-disable max-classes-per-file */

import CustomBaseError from './CustomBaseError.js';

export class LogicalError extends CustomBaseError {
  constructor(errorCode: number, message: string) {
    super(1000 + errorCode, 'Logical', message);
  }
}

export class InappropriateInteractionLogicalError extends LogicalError {
  /** LogicalError: 適切ではないインタラクションで実行を試みています。 */
  constructor(value?: string) {
    super(1, `適切ではないインタラクションで実行を試みています。${value ? `:${value}` : ''}`);
  }
}

export class UnexpectedElseLogicalError extends LogicalError {
  /** LogicalError: 到達しない条件分岐に到達しています。 */
  constructor(value?: string) {
    super(2, `到達しない条件分岐に到達しています。${value ? `:${value}` : ''}`);
  }
}

export class UnspecifiedValueLogicalError extends LogicalError {
  /** LogicalError: 指定された値以外が代入されています。 */
  constructor(value?: string) {
    super(3, `指定された値以外が代入されています。${value ? `:${value}` : ''}`);
  }
}
