import { EnvironmentType } from '../../config/config.js';
import { UnknownError } from '../../Error/UnknownError.js';
import { ShareObject } from '../../ShareObject/ShareObject.js';
import DiscordUserData from '../DatabaseHandle/DiscordUserData.js';

export enum ExecuteConditionResult {
  /** 結果がまだ出ていない時 */
  running = 0,
  /** 実行に成功した場合 */
  done = 1,
  /** ユーザーデータがnullで実行しなかった時 */
  data = 2,
  /** 名称違いで実行しなかった時 */
  name = 3,
  /** インタラクションタイプ違いで実行しなかった時 */
  interaction = 4,
  /** guildサーバーの条件違いで実行しなかった時 */
  guild = 5,
  /** メンションの条件違いで実行しなかった時 */
  mention = 6,
  /** 実行時間ではない時 */
  time = 7,
}

type ExecuteReturn<ResolveResult> =
  | {
      status: 'resolve';
      result: ResolveResult;
    }
  | {
      status: 'reject';
      result: ExecuteConditionResult;
    }
  | {
      status: 'error';
      result: Error;
    };

/**
 * Util/MainClass/にあるクラスの基底クラスです。
 */
abstract class EventClassBase<UserDataRequired extends boolean, ExecuteReturnType = void> {
  /**
   * デバッグ時に確認しやすくするために命名することができます。
   * ※コンストラクタに引数がない場合は、インスタンス生成後に命名します。
   */
  className?: string;

  /**
   * このクラスを置くディレクトリ名が指定されています。
   *
   * 例：DirectoryName = 'message' の場合、
   * src/Main/xxx/message/yyy.ts というファイルでインスタンス化されます。
   */
  static readonly DirectoryName: string;

  /**
   * メイン実行関数です。処理はこの関数内に記述します。
   * @param shareObject 共有オブジェクト
   * @param arg 拡張クラスで指定された引数
   */
  protected abstract main(
    shareObject: ShareObject,
    // userData: UserDataRequired extends true ? DiscordUserData : DiscordUserData | null,
    ...arg: any
  ): Promise<any>;

  /**
   * このクラスが読み込まれる実行環境を指定します。ここに指定されていない実行環境では読み込まれません。
   * @default Load/MainFileLoad/EnvironmentDefault
   */
  readonly loadingEnvironment?: EnvironmentType[];

  /**
   * main関数の引数userDataがnullAbleかどうかを指定します。
   * userDataが必須の場合、trueを指定することでmain関数内でnullチェックをする必要がなくなります。
   */
  readonly userDataRequired: UserDataRequired;

  /**
   * 基底クラスのコンストラクタです。
   * @param userDataRequired ユーザーデータが必須かどうか
   * @param loadingEnvironment このクラスが読み込まれる実行環境を指定します。
   */
  constructor(userDataRequired: UserDataRequired, loadingEnvironment?: EnvironmentType[]) {
    this.userDataRequired = userDataRequired;
    if (loadingEnvironment) {
      this.loadingEnvironment = loadingEnvironment;
    }
  }

  /**
   * userDataRequiredの条件に合致しているかどうかを返します。
   * @param userData ユーザーデータ
   * @returns userDataRequiredの条件に合致しているかどうか。
   * @example
   * userDataRequired = true & userData = null => false
   * userDataRequired = true & userData = any => true
   * userDataRequired = false & userData = null => true
   * userDataRequired = false & userData = any => true
   */
  protected userDataRequiredCheck = (userData: DiscordUserData | null): boolean => {
    if (this.userDataRequired) {
      return userData !== null;
    }
    return true;
  };

  /**
   * 実行条件に合致しているかどうかを返します。
   *
   * 拡張先でこの関数をオーバーライドすることで、実行条件を変更することができます。
   * @param shareObject 共有オブジェクト
   * @param userData ユーザーデータ
   * @param arg 拡張クラスで指定された引数
   * @returns 実行条件に合致しているかどうか。ExecuteReturn.runningを返すと、main関数が実行されます。
   */
  protected executeConditionCheck(
    shareObject: ShareObject,
    userData: DiscordUserData | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...arg: any
  ): ExecuteConditionResult {
    if (!this.userDataRequiredCheck(userData)) {
      return ExecuteConditionResult.data;
    }
    return ExecuteConditionResult.running;
  }

  /**
   * src/Event/にあるクラスから呼び出される関数です。
   * この関数内では、与えられた引数が、このクラスの実行条件に合致しているかどうかを確認し、合致している場合はmain関数を呼び出します。
   * @param shareObject 共有オブジェクト
   * @param userData ユーザーデータ
   * @param arg 拡張クラスで指定された引数
   * @returns main関数の戻り値
   */
  execute = async (
    shareObject: ShareObject,
    userData: DiscordUserData | null,
    ...arg: any
  ): Promise<ExecuteReturn<ExecuteReturnType>> => {
    const result = this.executeConditionCheck(shareObject, userData, ...arg);
    if (result !== ExecuteConditionResult.running) {
      return { status: 'reject', result };
    }

    try {
      const res = await this.main(shareObject, userData, ...arg);
      return ({ status: 'resolve' as const, result: res });
    } catch (err) {
      if (err instanceof Error) {
        return { status: 'error', result: err };
      }
      throw new UnknownError(err);
    }
  };
}

export default EventClassBase;
