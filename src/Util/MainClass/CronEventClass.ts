import dayjs from 'dayjs';
import { ShareObject } from '../../ShareObject/ShareObject.js';
import EventClassBase, { ExecuteConditionResult } from './EventClassBase.js';
import { EnvironmentType } from '../../config/config.js';
import DiscordUserData from '../DatabaseHandle/DiscordUserData.js';
import { UnknownError } from '../../Error/UnknownError.js';
import { UnexpectedElseLogicalError } from '../../Error/LogicalError.js';

/**
 * cronを実行するタイミング。
 * - shutdown: シャットダウン時
 * - day: 毎日0時
 * - hour: 毎時0分
 * - 5minute: 5分毎
 * - startup: 起動時。readyイベントの後に実行されます。
 */
type CronTime = 'shutdown' | 'day' | 'hour' | '5minute' | 'startup';

/**
 * cronクラスのコンストラクタ引数の型を指定します。
 */
interface CronEventClassConstructorArgsInterface<Main extends Function> {
  /**
   * cronを実行するタイミング。
   */
  cronTime: CronTime;
  /**
   * このクラスが読み込まれる実行環境を指定します。ここに指定されていない実行環境では読み込まれません。
   * @default Load/MainFileLoad/EnvironmentDefault
   */
  loadingEnvironment?: EnvironmentType[];
  /** コマンドが使用された際に呼び出される関数 */
  main: Main;
}

/**
 * 'src/Main/xxx/cron'で、このクラスのインスタンスを生成し、exportします。
 * constructor以外の関数は、インスタンスするファイルで認識する必要はありません。
 */
class CronEventClass extends EventClassBase<false> {
  static readonly DirectoryName = 'cron';

  readonly cronTime: CronTime;

  readonly main: (shareObject: ShareObject, executeTime: dayjs.Dayjs) => Promise<void>;

  /**
   * 指定の時間に実行する関数と、その周囲の設定を生成し、インスタンスを生成します。
   * @param args インスタンスを生成する際に必要な情報
   */
  constructor(args: CronEventClassConstructorArgsInterface<CronEventClass['main']>) {
    super(false, args.loadingEnvironment);
    this.cronTime = args.cronTime;
    this.main = args.main;
  }

  // eslint-disable-next-line jsdoc/require-throws
  /**
   * 実行時間に合致しているかどうかを返します。
   * @param executeTime 実行時間
   * @param irregular 不規則な実行を行う場合、shutdownかstartupを指定します
   * @returns 実行時間に合致しているかどうか
   */
  protected executeTimeCheck(
    executeTime: dayjs.Dayjs,
    irregular?: 'shutdown' | 'startup',
  ): boolean {
    switch (this.cronTime) {
      case 'shutdown':
        return typeof irregular !== 'undefined' && irregular === 'shutdown';
      case 'day':
        return (
          typeof irregular === 'undefined' && executeTime.hour() === 0 && executeTime.minute() === 0
        );
      case 'hour':
        return typeof irregular === 'undefined' && executeTime.minute() === 0;
      case '5minute':
        return typeof irregular === 'undefined' && executeTime.minute() % 5 === 0;
      case 'startup':
        return typeof irregular !== 'undefined' && irregular === 'startup';
      default: {
        const a: never = this.cronTime;
        throw new UnexpectedElseLogicalError(a);
      }
    }
  }

  /**
   * 実行条件に合致しているかどうかを返します。
   * @param shareObject 共有オブジェクト
   * @param userData ユーザーデータ
   * @param executeTime 実行時間
   * @param irregular 不規則な実行を行う場合、shutdownかstartupを指定します
   * @returns 実行条件に合致しているかどうか。ExecuteReturn.runningを返すと、main関数が実行されます。
   */
  protected executeConditionCheck(
    shareObject: ShareObject,
    userData: DiscordUserData | null,
    executeTime: dayjs.Dayjs,
    irregular?: 'shutdown' | 'startup',
  ): ExecuteConditionResult {
    if (!this.executeTimeCheck(executeTime, irregular)) {
      return ExecuteConditionResult.time;
    }

    return super.executeConditionCheck(shareObject, userData, executeTime);
  }

  execute = async (
    shareObject: ShareObject,
    userData: DiscordUserData | null,
    executeTime: dayjs.Dayjs,
    irregular?: 'shutdown' | 'startup',
  ) => {
    const result = this.executeConditionCheck(shareObject, userData, executeTime, irregular);
    if (result !== ExecuteConditionResult.running) {
      return { status: 'reject' as const, result };
    }

    try {
      const res = await this.main(shareObject, executeTime);
      return { status: 'resolve' as const, result: res };
    } catch (err) {
      if (err instanceof Error) {
        return { status: 'error' as const, result: err };
      }
      throw new UnknownError(err);
    }
  };
}

export default CronEventClass;
