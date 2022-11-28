/* eslint-disable max-classes-per-file */

import { DiscordAPIError } from 'discord.js';
import CustomBaseError from './CustomBaseError.js';

export class RuntimeError extends CustomBaseError {
  constructor(errorCode: number, message: string) {
    super(2000 + errorCode, 'Runtime', message);
  }
}

export class ValueIsUndefinedRuntimeError extends RuntimeError {
  /** RuntimeError: ${undefinedValue}が定義されていません */
  constructor(undefinedValue: string) {
    super(1, `${undefinedValue}が定義されていません。`);
  }
}

export class FailedToFetchValueRuntimeError extends RuntimeError {
  /** RuntimeError: ${value}を取得することができませんでした。 */
  constructor(value: string) {
    super(2, `${value}を取得することができませんでした。`);
  }
}

export class MessageAlreadySentRuntimeError extends RuntimeError {
  /** RuntimeError: 既にメッセージを送信しています。 */
  constructor() {
    super(3, '既にメッセージを送信しています。');
  }
}

export class ActionAlreadyExecutedFailedAddRuntimeError extends RuntimeError {
  /** RuntimeError: ${alreadyDone}が実行されているため、${failedAdd}を追加できません。 */
  constructor(alreadyDone: string, failedAdd: string) {
    super(4, `${alreadyDone}が実行されているため、${failedAdd}を追加できません。`);
  }
}

export class DiscordApiRuntimeError extends RuntimeError {
  readonly discordAPIError: DiscordAPIError;

  /** RuntimeError: DiscordのAPIエラーが発生しました。${error.rawError} */
  constructor(error: DiscordAPIError) {
    super(5, `DiscordのAPIエラーが発生しました。${JSON.stringify(error.rawError)}`);
    this.discordAPIError = error;
  }
}

export class FailedValidateRuntimeError extends RuntimeError {
  /** RuntimeError: データの検証に失敗しました。: ${error} */
  constructor(error: any) {
    super(6, `データの検証に失敗しました。: ${error}`);
  }
}

export class UnexpectedTypeRuntimeError extends RuntimeError {
  /** RuntimeError: 想定していない型が与えられました。${typeError} */
  constructor(typeError: string) {
    super(7, `想定していない型が与えられました。${typeError}`);
  }
}

export class FailedUpdateRuntimeError extends RuntimeError {
  /** RuntimeError: ${value}のデータの更新に失敗しました。 */
  constructor(value: string) {
    super(8, `${value}のデータの更新に失敗しました。`);
  }
}

export class UnexpectedValueRuntimeError extends RuntimeError {
  /** RuntimeError: ${value}で想定する入力ではない値が入力されました。\n入力値 : ${given}\n期待する値 : ${expected} */
  constructor(value: string, given: string, expected: string) {
    super(
      9,
      `${value}で想定する入力ではない値が入力されました。\n入力値 : ${given}\n期待する値 : ${expected}`,
    );
  }
}
