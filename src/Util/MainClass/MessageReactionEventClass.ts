// eslint-disable-next-line max-classes-per-file
import { EnvironmentType } from '../../config/config.js';
import { ShareObject } from '../../ShareObject/ShareObject.js';
import MessageReactionWrapper from '../../Wrapper/reaction/MessageReactionWrapper.js';
import DiscordUserData from '../DatabaseHandle/DiscordUserData.js';
import EventClassBase from './EventClassBase.js';

/**
 * リアクションイベントの拡張したクラスのコンストラクタ引数の型を指定します。
 */
interface MessageReactionEventClassConstructorArgsInterface<
  Main extends Function,
  UserDataRequired extends boolean,
> {
  /**
   * このクラスが読み込まれる実行環境を指定します。ここに指定されていない実行環境では読み込まれません。
   * @default Load/MainFileLoad/EnvironmentDefault
   */
  loadingEnvironment?: EnvironmentType[];

  /**
   * メッセージが送信された際に呼び出される関数。処理はこの関数内に記述します。
   */
  main: Main;

  /**
   * main関数の引数userDataがnullAbleかどうかを指定します。
   * userDataが必須の場合、trueを指定することでmain関数内でnullチェックをする必要がなくなります。
   */
  userDataRequired: UserDataRequired;
}

/**
 * リアクションイベントの基底クラスです。
 */
abstract class MessageReactionEventBaseClass<
  UserDataRequired extends boolean,
> extends EventClassBase<UserDataRequired> {
  static readonly DirectoryName = 'reaction';

  /**
   * コンストラクタ
   * @param userDataRequired ユーザーデータが必要かどうか
   * @param loadingEnvironment このクラスが読み込まれる実行環境を指定します。
   */
  constructor(
    readonly userDataRequired: UserDataRequired,
    readonly loadingEnvironment?: EnvironmentType[],
  ) {
    super(userDataRequired, loadingEnvironment);
  }
}

/**
 * 'src/Main/reaction'で、このクラスのインスタンスを生成し、exportします。
 * constructor以外の関数は、OnMessageCreateクラス内で使用するために存在し、インスタンスするファイルで認識する必要はありません。
 */
class MessageReactionAddEventClass<
  UserDataRequired extends boolean,
> extends MessageReactionEventBaseClass<UserDataRequired> {
  protected main: (
    shareObject: ShareObject,
    userData: DiscordUserData | null,
    reaction: MessageReactionWrapper,
  ) => Promise<void>;

  /**
   * onReactionAddイベントが呼ばれた際にじっこする関数と、その周囲の設定を生成し、インスタンスを生成します。
   * @param args インスタンス化に必要な情報
   */
  constructor(
    args: MessageReactionEventClassConstructorArgsInterface<
      MessageReactionAddEventClass<UserDataRequired>['main'],
      UserDataRequired
    >,
  ) {
    super(args.userDataRequired, args.loadingEnvironment);
    this.main = args.main;
  }
}

/**
 * 'src/Main/reaction'で、このクラスのインスタンスを生成し、exportします。
 * constructor以外の関数は、OnReactionRemoveクラス内で使用するために存在し、インスタンスするファイルで認識する必要はありません。
 */
class MessageReactionRemoveEventClass<
  UserDataRequired extends boolean,
> extends MessageReactionEventBaseClass<UserDataRequired> {
  protected main: (
    shareObject: ShareObject,
    userData: DiscordUserData | null,
    reaction: MessageReactionWrapper,
  ) => Promise<void>;

  /**
   * onReactionRemoveイベントが呼ばれた際にじっこする関数と、その周囲の設定を生成し、インスタンスを生成します。
   * @param args インスタンス化に必要な情報
   */
  constructor(
    args: MessageReactionEventClassConstructorArgsInterface<
      MessageReactionRemoveEventClass<UserDataRequired>['main'],
      UserDataRequired
    >,
  ) {
    super(args.userDataRequired, args.loadingEnvironment);
    this.main = args.main;
  }
}

export {
  MessageReactionEventBaseClass,
  MessageReactionAddEventClass,
  MessageReactionRemoveEventClass,
};
