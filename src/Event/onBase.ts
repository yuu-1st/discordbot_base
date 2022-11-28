import { Awaitable } from 'discord.js';
import Logger from '../Util/Logger.js';
import EventClassBase, { ExecuteConditionResult } from '../Util/MainClass/EventClassBase.js';

/**
 * イベントクラスを実行する際の引数
 */
interface EventClassExecuteArgs<
  ExecuteReturnType,
  EventClass extends EventClassBase<boolean, ExecuteReturnType>,
> {
  /** 実行するイベントクラスの配列 */
  eventClass: EventClass[];
  /** 実行するイベントクラスの引数 */
  classArgs: Parameters<EventClass['execute']>;
  /**
   * イベントクラス実行時、1つでもエラーが発生した場合、そのエラーを呼び出します。
   * ※複数の関数からエラーが出た場合、配列でより前にあるエラー1つのみが渡されます。
   * @param e エラー
   */
  resultError?: (e: Error) => Awaitable<void>;
  /**
   * イベントクラス実行時、1つでも成功した場合、その結果を呼び出します。
   * ※複数の関数から成功した場合、配列でより前にある成功1つのみが渡されます。
   * @param result 成功した結果
   */
  resultSuccess?: (result: ExecuteReturnType) => Awaitable<void>;
  /**
   * イベントクラス実行時、1つも成功しなかった場合、その結果を呼び出します。
   * @param e rejectした結果の配列
   */
  resultReject?: (e: Exclude<ExecuteConditionResult, 'running' | 'done'>[]) => Awaitable<void>;
}

/**
 * イベントクラスを実行する。
 * @param args 引数
 * @returns Promise<void>
 */
async function eventClassExecute<
  ExecuteReturnType,
  EventClass extends EventClassBase<boolean, ExecuteReturnType>,
>(args: EventClassExecuteArgs<ExecuteReturnType, EventClass>) {
  const { eventClass, classArgs, resultError, resultSuccess, resultReject } = args;

  const exec = eventClass.map(async (v) => {
    const [shareObject, userData, ...arg] = classArgs;
    const a = await v.execute(shareObject, userData, ...arg);
    return a;
  });
  const result = await Promise.all(exec);

  // エラーが1つでもあれば、エラーを返す。
  // ない場合、成功が1つでもあれば、成功を返す。
  // ない場合、rejectを返す。
  const error = result.flatMap((v) => (v.status === 'error' ? [v] : []));
  if (error.length !== 0) {
    if (resultError) {
      await resultError(error[0].result);
    } else {
      // デフォルトのエラー処理
      if (process.env.NODE_ENV !== 'production') {
        throw error[0].result;
      }
      error.forEach((v) => {
        // 本番環境でのエラーはログ出力する
        Logger.error('system', v.result);
      });
    }
    return;
  }

  const success = result.flatMap((v) => (v.status === 'resolve' ? [v] : []));
  if (success.length !== 0) {
    if (resultSuccess) {
      await resultSuccess(success[0].result);
    }
    return;
  }

  const reject = result.flatMap((v) => (v.status === 'reject' ? [v] : []));
  if (reject.length !== 0) {
    if (resultReject) {
      await resultReject(reject.map((v) => v.result));
    }
    // eslint-disable-next-line no-useless-return
    return;
  }
}

export { eventClassExecute };
