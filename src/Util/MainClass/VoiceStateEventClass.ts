/* eslint-disable max-classes-per-file */
import { ShareObject } from '../../ShareObject/ShareObject.js';
import VoiceStateUpdateWrapper from '../../Wrapper/voice/VoiceStateUpdateWrapper.js';
import { EnvironmentType } from '../../config/config.js';
import DiscordUserData from '../DatabaseHandle/DiscordUserData.js';
import EventClassBase from './EventClassBase.js';

/**
 * VoiceStateイベントのコンストラクタ引数の型を指定します。
 */
interface VoiceStateEventClassConstructorArgsInterface<
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
 * 'src/Main/xxx/voice'で、このクラスのインスタンスを生成し、exportします。
 * constructor以外の関数は、インスタンスするファイルで認識する必要はありません。
 */
class VoiceStateEventClass<
  UserDataRequired extends boolean,
> extends EventClassBase<UserDataRequired> {
  static readonly DirectoryName = 'voice';

  protected main: (
    shareObject: ShareObject,
    userData: UserDataRequired extends true ? DiscordUserData : DiscordUserData | null,
    voiceStates: VoiceStateUpdateWrapper,
  ) => Promise<void>;

  /**
   * onVoiceStateUpdateイベントが呼ばれた際に実行する関数と、その周囲の設定を生成し、インスタンス化します。
   * @param args main関数とその周囲の設定
   */
  constructor(
    args: VoiceStateEventClassConstructorArgsInterface<
      VoiceStateEventClass<UserDataRequired>['main'],
      UserDataRequired
    >,
  ) {
    super(args.userDataRequired, args.loadingEnvironment);
    this.main = args.main;
  }
}

export { VoiceStateEventClass };
