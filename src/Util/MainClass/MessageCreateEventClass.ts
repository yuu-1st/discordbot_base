/* eslint-disable max-classes-per-file */
import { PartialShareObject, ShareObject } from '../../ShareObject/ShareObject.js';
import EventClassBase, { ExecuteConditionResult } from './EventClassBase.js';
import DiscordUserData from '../DatabaseHandle/DiscordUserData.js';
import { EnvironmentType } from '../../config/config.js';
import MessageWrapper, { PartialMessageWrapper } from '../../Wrapper/message/MessageWrapper.js';

/**
 * User: ユーザーメンションのみ / Role: リプライによるメンションのみ / All: 全てのメッセージ
 */
type mentionOnlyType = 'User' /* | 'Reply' */ | 'All';

/**
 * デフォルトのメンションの種類です。
 */
const mentionDefault: mentionOnlyType = 'All';

/**
 * MessageEventClassの拡張したクラスのコンストラクタ引数の型を指定します。
 */
interface MessageEventClassConstructorArgsInterface<
  Main extends Function,
  GuildOnly extends boolean,
  UserDataRequired extends boolean,
> {
  /**
   *  trueの場合、送信されたメッセージがギルドサーバーからの時のみ関数を呼び出します。
   */
  guildOnly: GuildOnly;

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
   * 全てのメッセージで実行するか、botへのメンションがある場合のみ関数を呼び出すかを指定します。
   * @default mentionDefault
   */
  mentionOnly?: mentionOnlyType;

  /**
   * main関数の引数userDataがnullAbleかどうかを指定します。
   * userDataが必須の場合、trueを指定することでmain関数内でnullチェックをする必要がなくなります。
   */
  userDataRequired: UserDataRequired;
}

/**
 * メッセージイベントの基底クラスです。
 */
abstract class MessageEventClass<
  UserDataRequired extends boolean,
  GuildOnly extends boolean,
> extends EventClassBase<UserDataRequired> {
  static readonly DirectoryName = 'message';

  /**
   * コンストラクタ
   * @param userDataRequired ユーザーデータが必須かどうか
   * @param mentionOnly 関数呼び出しの条件として、メンションがあるかどうかを指定します。
   * @param guildOnly 関数呼び出しの条件として、ギルドサーバーからのメッセージかどうかを指定します。
   * @param loadingEnvironment このクラスが読み込まれる実行環境を指定します。
   */
  constructor(
    userDataRequired: UserDataRequired,
    readonly mentionOnly: mentionOnlyType,
    readonly guildOnly: GuildOnly,
    loadingEnvironment?: EnvironmentType[],
  ) {
    super(userDataRequired, loadingEnvironment);
  }

  /**
   * guildOnlyの条件に合致しているかどうかを返します。
   *
   * [注意]execute関数内で型注釈なしでmainを呼び出せるように、messageの型情報が変更されます。
   * - guildOnlyがfalseの場合、messageの型はMessageWrapper<false>の可能性があります。
   * - MessageWrapperは、PartialMessageWrapperの可能性があります。
   * @param message メッセージ
   * @returns guildOnlyの条件に合致しているかどうか
   * @example
   * guildOnly = true & message.isInGuild() = true => true
   * guildOnly = true & message.isInGuild() = false => false
   * guildOnly = false & message.isInGuild() = true => true
   * guildOnly = false & message.isInGuild() = false => true
   */
  protected guildOnlyCheck = (message: MessageWrapper | PartialMessageWrapper): boolean => {
    if (this.guildOnly) {
      return message.isInGuild();
    }
    return true;
  };

  /**
   * mentionOnlyの条件に合致しているかどうかを返します。
   * @param shareObject 共有オブジェクト('selfOperation'のみ使用)
   * @param message メッセージ
   * @returns mentionOnlyの条件に合致しているかどうか
   * @example
   * mentionOnly = 'All' & message.isMentioned() = any => true
   * mentionOnly = 'All' & message.isReplyMentioned() = any => true
   * mentionOnly = 'User' & message.isMentioned() = true => true
   * mentionOnly = 'User' & message.isMentioned() = false => false
   * mentionOnly = 'Reply' & message.isReplyMentioned() = true => true
   * mentionOnly = 'Reply' & message.isReplyMentioned() = false => false
   */
  protected mentionOnlyCheck = (
    shareObject: PartialShareObject<'selfOperation'>,
    message: MessageWrapper | PartialMessageWrapper,
  ): boolean => {
    if (this.mentionOnly === 'All') {
      return true;
    }
    if (this.mentionOnly === 'User') {
      return message.isMentioned(shareObject.selfOperation.userId);
    }
    if (this.mentionOnly === 'Reply') {
      // TODO: リプライによるメンションのみの場合の処理を追加する
    }
    return false;
  };

  /**
   * 実行条件に合致しているかどうかを返します。
   * @param shareObject 共有オブジェクト
   * @param userData ユーザーデータ
   * @param message メッセージ
   * @returns main関数の戻り値
   */
  protected executeConditionCheck = (
    shareObject: ShareObject,
    userData: DiscordUserData | null,
    message: MessageWrapper<boolean> | PartialMessageWrapper,
  ): ExecuteConditionResult => {
    // guildOnlyのチェック
    if (!this.guildOnlyCheck(message)) {
      return ExecuteConditionResult.guild;
    }

    // mentionOnlyのチェック
    if (!this.mentionOnlyCheck(shareObject, message)) {
      return ExecuteConditionResult.mention;
    }
    return super.executeConditionCheck(shareObject, userData);
  };
}

/**
 * 'src/Main/xxx/message/'で、このクラスのインスタンスを生成し、exportします。
 * constructor以外の関数は、インスタンスするファイルで認識する必要はありません。
 */
class MessageCreateEventClass<
  UserDataRequired extends boolean,
  GuildOnly extends boolean,
> extends MessageEventClass<UserDataRequired, GuildOnly> {
  static readonly DirectoryName = 'message';

  protected main: (
    shareObject: ShareObject,
    userData: UserDataRequired extends true ? DiscordUserData : DiscordUserData | null,
    message: MessageWrapper<GuildOnly extends true ? true : boolean>,
  ) => Promise<void>;

  /**
   * onInteractionCreateイベントが呼ばれた際に実行する関数と、その周囲の設定を生成し、インスタンスを生成します。
   * @param args MessageEventClassConstructorArgsInterface
   */
  constructor(
    args: MessageEventClassConstructorArgsInterface<
      MessageCreateEventClass<UserDataRequired, GuildOnly>['main'],
      GuildOnly,
      UserDataRequired
    >,
  ) {
    super(
      args.userDataRequired,
      args.mentionOnly ?? mentionDefault,
      args.guildOnly,
      args.loadingEnvironment,
    );
    this.main = args.main;
  }
}

/**
 * 'src/Main/xxx/message/'で、このクラスのインスタンスを生成し、exportします。
 * constructor以外の関数は、OnMessageDeleteクラス内で使用するために存在し、インスタンスするファイルで認識する必要はありません。
 */
class MessageDeleteEventClass<
  UserDataRequired extends boolean,
  GuildOnly extends boolean,
> extends MessageEventClass<UserDataRequired, GuildOnly> {
  static readonly DirectoryName = 'message';

  protected main: (
    shareObject: ShareObject,
    userData: UserDataRequired extends true ? DiscordUserData : DiscordUserData | null,
    message: MessageWrapper<GuildOnly extends true ? true : boolean> | PartialMessageWrapper,
  ) => Promise<void>;

  /**
   * onInteractionDeleteイベントが呼ばれた際に実行する関数と、その周囲の設定を生成し、インスタンスを生成します。
   * @param args MessageEventClassConstructorArgsInterface
   */
  constructor(
    args: MessageEventClassConstructorArgsInterface<
      MessageDeleteEventClass<UserDataRequired, GuildOnly>['main'],
      GuildOnly,
      UserDataRequired
    >,
  ) {
    super(
      args.userDataRequired,
      args.mentionOnly ?? mentionDefault,
      args.guildOnly,
      args.loadingEnvironment,
    );
    this.main = args.main;
  }
}

/**
 * 'src/Main/xxx/message/'で、このクラスのインスタンスを生成し、exportします。
 * constructor以外の関数は、OnMessageUpdateクラス内で使用するために存在し、インスタンスするファイルで認識する必要はありません。
 */
class MessageUpdateEventClass<
  UserDataRequired extends boolean,
  GuildOnly extends boolean,
> extends MessageEventClass<UserDataRequired, GuildOnly> {
  static readonly DirectoryName = 'message';

  protected main: (
    shareObject: ShareObject,
    userData: UserDataRequired extends true ? DiscordUserData : DiscordUserData | null,
    oldMessage: MessageWrapper<GuildOnly extends true ? true : boolean> | PartialMessageWrapper,
    newMessage: MessageWrapper<GuildOnly extends true ? true : boolean> | PartialMessageWrapper,
  ) => Promise<void>;

  /**
   * onInteractionDeleteイベントが呼ばれた際に実行する関数と、その周囲の設定を生成し、インスタンスを生成します。
   * @param args MessageEventClassConstructorArgsInterface
   */
  constructor(
    args: MessageEventClassConstructorArgsInterface<
      MessageUpdateEventClass<UserDataRequired, GuildOnly>['main'],
      GuildOnly,
      UserDataRequired
    >,
  ) {
    super(
      args.userDataRequired,
      args.mentionOnly ?? mentionDefault,
      args.guildOnly,
      args.loadingEnvironment,
    );
    this.main = args.main;
  }
}

export {
  MessageEventClass,
  MessageCreateEventClass,
  MessageDeleteEventClass,
  MessageUpdateEventClass,
};
