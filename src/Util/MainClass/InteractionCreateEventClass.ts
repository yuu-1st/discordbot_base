/* eslint-disable max-classes-per-file */
import assert from 'assert';
import { EnvironmentType } from '../../config/config.js';
import { ShareObject } from '../../ShareObject/ShareObject.js';
import AutoCompleteInteractionWrapper from '../../Wrapper/interaction/AutoCompleteInteractionWrapper.js';
import ButtonInteractionWrapper from '../../Wrapper/interaction/ButtonInteractionWrapper.js';
import ChatInputCommandInteractionWrapper from '../../Wrapper/interaction/ChatInputCommandInteractionWrapper.js';
import InteractionWrapper from '../../Wrapper/interaction/interactionWrapper.js';
import InteractionWrapperOperation from '../../Wrapper/interaction/InteractionWrapperOperation.js';
import ModalSubmitInteractionWrapper from '../../Wrapper/interaction/ModalSubmitInteractionWrapper.js';
import SelectMenuInteractionWrapper from '../../Wrapper/interaction/SelectMenuInteractionWrapper.js';
import DiscordUserData from '../DatabaseHandle/DiscordUserData.js';
import {
  CommandObject,
  CommandOption,
  ConvertCommandObjectToArgs,
  createCommandOptionsToObject,
  createSubCommandObjectsToObject,
  KeyList,
  SubCommandObject,
} from './CommandObject.js';
import EventClassBase, { ExecuteConditionResult } from './EventClassBase.js';
import { UnknownError } from '../../Error/UnknownError.js';
import { UnexpectedElseLogicalError } from '../../Error/LogicalError.js';

/**
 * InteractionEventClassの拡張したクラスのコンストラクタ引数の型を指定します。
 */
interface InteractionEventClassArgsInterface<
  Main extends Function,
  UserDataRequired extends boolean,
> {
  /** interactionの名称。この値を元に、コマンド名が一致すればmainが呼び出されます。 */
  interactionName: string | RegExp;

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
 * インタラクションイベントの基底クラスです。
 */
abstract class InteractionCreateEventBaseClass<T extends boolean> extends EventClassBase<T> {
  static readonly DirectoryName = 'interaction';

  readonly interactionName: string | RegExp;

  /**
   * コンストラクタ
   * @param userDataRequired ユーザーデータが必要かどうか
   * @param interactionName interactionの名称。この値を元に、コマンド名が一致すればmainが呼び出されます。
   * @param loadingEnvironment このクラスが読み込まれる実行環境を指定します。
   */
  constructor(
    userDataRequired: T,
    interactionName: string | RegExp,
    loadingEnvironment?: EnvironmentType[],
  ) {
    super(userDataRequired, loadingEnvironment);
    this.interactionName = interactionName;
  }

  /**
   * 実行条件に合致しているかどうかを返します。
   * @param shareObject 共有オブジェクト
   * @param userData ユーザーデータ
   * @param interaction interactionオブジェクト
   * @returns 実行条件に合致しているかどうか。ExecuteConditionResult.runningを返すと、main関数が実行されます。
   */
  protected executeConditionCheck(
    shareObject: ShareObject,
    userData: DiscordUserData | null,
    interaction: InteractionWrapper,
  ): ExecuteConditionResult {
    if (this.interactionName instanceof RegExp) {
      if (!this.interactionName.test(interaction.getInteractionName())) {
        return ExecuteConditionResult.name;
      }
    } else if (this.interactionName !== interaction.getInteractionName()) {
      return ExecuteConditionResult.name;
    }
    return super.executeConditionCheck(shareObject, userData, interaction);
  }
}

/**
 * 'src/Main/xxx/interaction/'で、このクラスのインスタンスを生成し、exportします。
 * constructor以外の関数は、OnInteractionCreateクラス内で使用するために存在し、インスタンスするファイルで認識する必要はありません。
 */
class AutoCompleteInteractionCreateEventClass<
  T extends boolean,
> extends InteractionCreateEventBaseClass<T> {
  main: (
    shareObject: ShareObject,
    userData: T extends true ? DiscordUserData : DiscordUserData | null,
    interaction: AutoCompleteInteractionWrapper,
  ) => Promise<void>;

  /**
   * onInteractionCreateイベントが呼ばれた際に実行する関数と、その周囲の設定を生成し、インスタンスを生成します。
   * @param args 必要なプロパティを指定します。
   */
  constructor(
    args: InteractionEventClassArgsInterface<AutoCompleteInteractionCreateEventClass<T>['main'], T>,
  ) {
    super(args.userDataRequired, args.interactionName, args.loadingEnvironment);
    this.main = args.main;
  }

  protected executeConditionCheck = (
    shareObject: ShareObject,
    userData: DiscordUserData | null,
    interaction: InteractionWrapper,
  ): ExecuteConditionResult => {
    if (!InteractionWrapperOperation.isAutoComplete(interaction)) {
      return ExecuteConditionResult.interaction;
    }
    return super.executeConditionCheck(shareObject, userData, interaction);
  };
}

/**
 * 'src/Main/xxx/interaction/'で、このクラスのインスタンスを生成し、exportします。
 * constructor以外の関数は、OnInteractionCreateクラス内で使用するために存在し、インスタンスするファイルで認識する必要はありません。
 */
class ButtonInteractionCreateEventClass<
  T extends boolean,
> extends InteractionCreateEventBaseClass<T> {
  main: (
    shareObject: ShareObject,
    userData: T extends true ? DiscordUserData : DiscordUserData | null,
    interaction: ButtonInteractionWrapper,
  ) => Promise<void>;

  /**
   * onInteractionCreateイベントが呼ばれた際に実行する関数と、その周囲の設定を生成し、インスタンスを生成します。
   * @param args 必要なプロパティを指定します。
   */
  constructor(
    args: InteractionEventClassArgsInterface<ButtonInteractionCreateEventClass<T>['main'], T>,
  ) {
    super(args.userDataRequired, args.interactionName, args.loadingEnvironment);
    this.main = args.main;
  }

  protected executeConditionCheck = (
    shareObject: ShareObject,
    userData: DiscordUserData | null,
    interaction: InteractionWrapper,
  ): ExecuteConditionResult => {
    if (!InteractionWrapperOperation.isButton(interaction)) {
      return ExecuteConditionResult.interaction;
    }
    return super.executeConditionCheck(shareObject, userData, interaction);
  };
}

/**
 * 'src/Main/xxx/interaction/'で、このクラスのインスタンスを生成し、exportします。
 * constructor以外の関数は、OnInteractionCreateクラス内で使用するために存在し、インスタンスするファイルで認識する必要はありません。
 */
class ModalSubmitInteractionCreateEventClass<
  T extends boolean,
> extends InteractionCreateEventBaseClass<T> {
  main: (
    shareObject: ShareObject,
    userData: T extends true ? DiscordUserData : DiscordUserData | null,
    interaction: ModalSubmitInteractionWrapper,
  ) => Promise<void>;

  /**
   * onInteractionCreateイベントが呼ばれた際に実行する関数と、その周囲の設定を生成し、インスタンスを生成します。
   * @param args 必要なプロパティを指定します。
   */
  constructor(
    args: InteractionEventClassArgsInterface<ModalSubmitInteractionCreateEventClass<T>['main'], T>,
  ) {
    super(args.userDataRequired, args.interactionName, args.loadingEnvironment);
    this.main = args.main;
  }

  protected executeConditionCheck = (
    shareObject: ShareObject,
    userData: DiscordUserData | null,
    interaction: InteractionWrapper,
  ): ExecuteConditionResult => {
    if (!InteractionWrapperOperation.isModalSubmit(interaction)) {
      return ExecuteConditionResult.interaction;
    }
    return super.executeConditionCheck(shareObject, userData, interaction);
  };
}

/**
 * 'src/Main/xxx/interaction/'で、このクラスのインスタンスを生成し、exportします。
 * constructor以外の関数は、OnInteractionCreateクラス内で使用するために存在し、インスタンスするファイルで認識する必要はありません。
 */
class SelectMenuInteractionCreateEventClass<
  T extends boolean,
> extends InteractionCreateEventBaseClass<T> {
  main: (
    shareObject: ShareObject,
    userData: T extends true ? DiscordUserData : DiscordUserData | null,
    interaction: SelectMenuInteractionWrapper,
  ) => Promise<void>;

  /**
   * onInteractionCreateイベントが呼ばれた際に実行する関数と、その周囲の設定を生成し、インスタンスを生成します。
   * @param args 必要なプロパティを指定します。
   */
  constructor(
    args: InteractionEventClassArgsInterface<SelectMenuInteractionCreateEventClass<T>['main'], T>,
  ) {
    super(args.userDataRequired, args.interactionName, args.loadingEnvironment);
    this.main = args.main;
  }

  protected executeConditionCheck = (
    shareObject: ShareObject,
    userData: DiscordUserData | null,
    interaction: InteractionWrapper,
  ): ExecuteConditionResult => {
    if (!InteractionWrapperOperation.isSelectMenu(interaction)) {
      return ExecuteConditionResult.interaction;
    }
    return super.executeConditionCheck(shareObject, userData, interaction);
  };
}

/**
 * 'src/Main/xxx/interaction/'で、このクラスのインスタンスを生成し、exportします。
 * constructor以外の関数は、OnInteractionCreateクラス内で使用するために存在し、インスタンスするファイルで認識する必要はありません。
 */
class ChatInputInteractionCreateEventClass<
  T extends boolean,
  C extends CommandObject | null,
> extends InteractionCreateEventBaseClass<T> {
  readonly commandObject: C;

  main: (
    shareObject: ShareObject,
    userData: T extends true ? DiscordUserData : DiscordUserData | null,
    interaction: ChatInputCommandInteractionWrapper,
    args: C extends CommandObject ? ConvertCommandObjectToArgs<C> : {},
  ) => Promise<void>;

  /**
   * onInteractionCreateイベントが呼ばれた際に実行する関数と、その周囲の設定を生成し、インスタンスを生成します。
   * @param args interactionNameを含む必要なプロパティを指定します。
   */
  constructor(
    args: InteractionEventClassArgsInterface<ChatInputInteractionCreateEventClass<T, C>['main'], T>,
  );

  /**
   * onInteractionCreateイベントが呼ばれた際に実行する関数と、その周囲の設定を生成し、インスタンスを生成します。
   * @param args commandObjectを含む必要なプロパティを指定します。
   */
  constructor(args: {
    /**
     *  ChatInputCommandの仕様オブジェクト。CommandObjectクラスを用いて作成します。
     */
    commandObject: NonNullable<C>;

    /**
     * このクラスが読み込まれる実行環境を指定します。ここに指定されていない実行環境では読み込まれません。
     * @default Load/MainFileLoad/EnvironmentDefault
     */
    loadingEnvironment?: EnvironmentType[];

    /**
     * メッセージが送信された際に呼び出される関数。処理はこの関数内に記述します。
     */
    main: ChatInputInteractionCreateEventClass<T, C>['main'];

    /**
     * main関数の引数userDataがnullAbleかどうかを指定します。
     * userDataが必須の場合、trueを指定することでmain関数内でnullチェックをする必要がなくなります。
     */
    userDataRequired: T;
  });

  /* eslint-disable jsdoc/require-param, jsdoc/check-param-names */
  /**
   * onInteractionCreateイベントが呼ばれた際に実行する関数と、その周囲の設定を生成し、インスタンスを生成します。
   * @param args commandObject / interactionNameを含む必要なプロパティを指定します。
   */
  constructor(args: {
    commandObject?: NonNullable<C>;
    interactionName?: string | RegExp;
    loadingEnvironment?: EnvironmentType[];
    main: ChatInputInteractionCreateEventClass<T, C>['main'];
    userDataRequired: T;
  }) {
    const { commandObject, interactionName } = (() => {
      if ('commandObject' in args) {
        assert(typeof args.commandObject !== 'undefined');
        return { commandObject: args.commandObject as C, interactionName: args.commandObject.name };
      }
      if ('interactionName' in args) {
        assert(typeof args.interactionName !== 'undefined');
        return { commandObject: null as C, interactionName: args.interactionName };
      }
      throw new UnexpectedElseLogicalError();
    })();

    super(args.userDataRequired, interactionName, args.loadingEnvironment);
    this.commandObject = commandObject;
    this.main = args.main;
  }
  /* eslint-enable jsdoc/require-param, jsdoc/check-param-names */

  protected executeConditionCheck = (
    shareObject: ShareObject,
    userData: DiscordUserData | null,
    interaction: InteractionWrapper,
  ): ExecuteConditionResult => {
    if (!InteractionWrapperOperation.isChatInputCommand(interaction)) {
      return ExecuteConditionResult.interaction;
    }
    return super.executeConditionCheck(shareObject, userData, interaction);
  };

  /**
   * interactionからthis.CommandObjectに基づいた引数のオブジェクトを生成します。
   * @param interaction interactionオブジェクト
   * @returns 引数のオブジェクト
   */
  private createArgs = (
    interaction: ChatInputCommandInteractionWrapper,
  ): C extends CommandObject ? ConvertCommandObjectToArgs<C> : {} => {
    const nullObject = {} as C extends CommandObject ? ConvertCommandObjectToArgs<C> : {};
    if (this.commandObject === null) {
      return nullObject;
    }
    if (this.commandObject.option) {
      const { option } = this.commandObject;
      if ('require' in option[0]) {
        const commandOption = option as readonly CommandOption<KeyList, string, boolean>[];
        return createCommandOptionsToObject(commandOption, interaction);
      }
      const commandOption = option as readonly SubCommandObject<string>[];
      return createSubCommandObjectsToObject(commandOption, interaction);
    }
    return nullObject;
  };

  execute = async (
    shareObject: ShareObject,
    userData: DiscordUserData | null,
    interaction: InteractionWrapper,
  ) => {
    const result = this.executeConditionCheck(shareObject, userData, interaction);
    if (result !== ExecuteConditionResult.running) {
      return { status: 'reject' as const, result };
    }
    assert(InteractionWrapperOperation.isChatInputCommand(interaction));

    const args = this.createArgs(interaction);

    try {
      const res = await this.main(shareObject, userData as any, interaction, args);
      return { status: 'resolve' as const, result: res };
    } catch (error) {
      if (error instanceof Error) {
        return { status: 'error' as const, result: error };
      }
      return { status: 'error' as const, result: new UnknownError(error) };
    }
  };
}

export {
  AutoCompleteInteractionCreateEventClass,
  ButtonInteractionCreateEventClass,
  ChatInputInteractionCreateEventClass,
  InteractionCreateEventBaseClass,
  ModalSubmitInteractionCreateEventClass,
  SelectMenuInteractionCreateEventClass,
};
