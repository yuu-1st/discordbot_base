/* eslint-disable max-classes-per-file */

import CustomBaseError from './CustomBaseError.js';

export class UnknownError extends CustomBaseError {
  protected unknownError: unknown;

  constructor(error: unknown, message?: string) {
    super(0, 'Unknown', message ?? '');
    this.unknownError = error;
  }

  errorObject = () => this.unknownError;
}

/**
 * switch文などの網羅チェックの際に使用するエラー
 * @example https://typescriptbook.jp/reference/statements/never#例外による網羅性チェック
 */
export class ExhaustiveError extends UnknownError {
  constructor(value: never, message = `Unsupported type: ${value}`) {
    super(message);
  }
}

/**
 * Error型以外の例外を除外し、UnknownErrorとして投げます。
 * ※この関数に対し、returnもしくはthrowをする必要があります。
 * @param e try-catchでcatchしたエラーe
 * @param err Error型に限定したエラーeを処理する関数
 * @throws UnknownError Error型ではないeが投げられていた場合
 */
export const handleUnknownError = (e: unknown, err: (error: Error) => never): never => {
  if (e instanceof UnknownError) {
    throw e;
  } else if (e instanceof Error) {
    err(e);
  } else {
    throw new UnknownError(e);
  }
};
// export const handleUnknownError = <T>(
//   e: unknown,
//   err: ((error: Error) => never) | [
//     new () => T,
//     Parameters<new () => T>,
//   ],
// ): never => {
//   if (e instanceof UnknownError) {
//     throw e;
//   } else if (e instanceof Error) {
//     if (err.name === 'constructor') {
//       err(e);
//     } else {
//       throw new err(e);
//     }
//   } else {
//     throw new UnknownError(e);
//   }
// };
