import {
  ApplicationCommandOptionBase,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { UnexpectedElseLogicalError } from '../../Error/LogicalError.js';
import { EnvironmentType } from '../../config/config.js';
import {
  CommandAttachmentOption,
  CommandBooleanOption,
  CommandChannelOption,
  CommandIntegerOption,
  CommandMentionableOption,
  CommandNumberOption,
  CommandObject,
  CommandOption,
  CommandOptionBase,
  CommandRoleOption,
  CommandStringOption,
  CommandUserOption,
  KeyList,
  SubCommandObject,
} from './CommandObject.js';
import { InteractionCreateEventBaseClass } from './InteractionCreateEventClass.js';

type CreateCommandType = {
  /**
   * @param name コマンド名
   * @param description コマンドの説明
   * @param loadingEnvironment コマンド設定実行環境
   */
  (
    name: string,
    description: string,
    loadingEnvironment?: EnvironmentType[],
  ): SetCommand<SlashCommandBuilder>;
  /**
   * @param arg コマンド情報をセットしたCommandObject
   * @param loadingEnvironment コマンド設定実行環境
   */
  (arg: CommandObject, loadingEnvironment?: EnvironmentType[]): SetCommand<SlashCommandBuilder>;
};

type CreateSubCommandType = {
  /**
   * @param name コマンド名
   * @param description コマンドの説明
   */
  (name: string, description: string): Omit<
    SetCommand<SlashCommandSubcommandBuilder>,
    'addSubCommandOption'
  >;
  /**
   * @param arg コマンド情報をセットしたCommandObject
   */
  (arg: SubCommandObject<string>): Omit<
    SetCommand<SlashCommandSubcommandBuilder>,
    'addSubCommandOption'
  >;
};

/**
 * SlashCommandBuilderのwrapperです。
 * ジェネリクスは、オプションをそのまま引数に渡されるという作成をするためのものです。現在試作中…
 * ↑を使う前提での説明
 * addXXOptionは、戻り値がジェネリクス更新後のクラスとなるため、
 * オプションを追加するたびに新しい変数に追加する必要があります。
 */
class SetCommand<
  CommandBuilder extends SlashCommandBuilder | SlashCommandSubcommandBuilder = SlashCommandBuilder,
> extends InteractionCreateEventBaseClass<false> {
  readonly command: CommandBuilder;

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  protected main = async () => {};

  /**
   * コンストラクタ。
   * @param command インスタンス済みのSlashCommandBuilder
   * @param loadingEnvironment このクラスが読み込まれる実行環境を指定します。
   */
  constructor(command: CommandBuilder, loadingEnvironment?: EnvironmentType[]) {
    super(false, 'setCommand', loadingEnvironment);
    this.command = command;
  }

  /* eslint-disable-next-line jsdoc/require-param */
  /**
   * コマンドを生成します。
   * @returns インスタンス化したSetCommand
   */
  static createCommand: CreateCommandType = (
    arg1: string | CommandObject,
    arg2?: string | EnvironmentType[],
    arg3?: EnvironmentType[],
  ): SetCommand<SlashCommandBuilder> => {
    const { name, description, option, loadingEnvironment } = (() => {
      if (typeof arg1 === 'string') {
        if (typeof arg2 === 'undefined') {
          throw new UnexpectedElseLogicalError();
        } else if (arg2 instanceof Array) {
          throw new UnexpectedElseLogicalError();
        }
        return { name: arg1, description: arg2, option: undefined, loadingEnvironment: arg3 };
      }
      if (typeof arg2 === 'string') {
        throw new UnexpectedElseLogicalError();
      }
      return { ...arg1, loadingEnvironment: arg2 };
    })();
    const builder = new SlashCommandBuilder();
    const setCommand = new SetCommand(builder, loadingEnvironment);
    setCommand.setName(name);
    setCommand.setDescription(description);
    if (option instanceof Array) {
      setCommand.setCommandOptions(option);
    }
    return setCommand;
  };

  /* eslint-disable-next-line jsdoc/require-param */
  /**
   * コマンドを生成します。
   * @returns インスタンス化したSetCommand
   */
  static createSubCommand: CreateSubCommandType = (
    arg1: string | SubCommandObject<string>,
    arg2?: string,
  ): Omit<SetCommand<SlashCommandSubcommandBuilder>, 'addSubCommandOption'> => {
    const { name, description, option } = (() => {
      if (typeof arg1 === 'string') {
        if (typeof arg2 === 'undefined') {
          throw new UnexpectedElseLogicalError();
        }
        return { name: arg1, description: arg2, option: undefined };
      }
      return arg1;
    })();
    const builder = new SlashCommandSubcommandBuilder();
    const setCommand = new SetCommand(builder);
    setCommand.setName(name);
    setCommand.setDescription(description);
    if (option instanceof Array) {
      setCommand.setCommandOptions(option);
    }
    return setCommand;
  };

  private static setOptionBase = <T extends ApplicationCommandOptionBase>(
    op: T,
    arg: Omit<CommandOptionBase<KeyList, string, boolean>, 'key' | 'value'>,
  ): T => {
    // TODO: setNameのエラー処理
    const sc = op.setName(arg.name).setDescription(arg.description).setRequired(arg.require);
    return sc;
  };

  /**
   * コマンド名を取得します。
   * @returns コマンド名
   */
  getName = () => this.command.name;

  /**
   * コマンド名を付けます。
   * @param name コマンド名
   */
  setName = (name: string) => {
    this.command.setName(name);
  };

  /**
   * コマンドの説明を付けます。
   * @param description コマンドの説明
   */
  setDescription = (description: string) => {
    this.command.setDescription(description);
  };

  /**
   * 指定のオブジェクトを利用し、必要なオプションをまとめて設定します。
   * @param options オプションの配列
   */
  setCommandOptions = (
    options: CommandBuilder extends SlashCommandBuilder
      ? readonly CommandOption<KeyList, string, boolean>[] | readonly SubCommandObject<string>[]
      : readonly CommandOption<KeyList, string, boolean>[],
  ) => {
    options.forEach((value) => {
      switch (value.key) {
        case 'attachment': {
          const { key } = value;
          const v = { ...value, key };
          this.addAttachmentOption(v);
          break;
        }
        case 'boolean': {
          const { key } = value;
          const v = { ...value, key };
          this.addBooleanOption(v);
          break;
        }
        case 'channel': {
          const { key } = value;
          const v = { ...value, key };
          this.addChannelOption(v);
          break;
        }
        case 'integer': {
          const { key } = value;
          const v = { ...value, key };
          this.addIntegerOption(v);
          break;
        }
        case 'mentionable': {
          const { key } = value;
          const v = { ...value, key };
          this.addMentionableOption(v);
          break;
        }
        case 'number': {
          const { key } = value;
          const v = { ...value, key };
          this.addNumberOption(v);
          break;
        }
        case 'role': {
          const { key } = value;
          const v = { ...value, key };
          this.addRoleOption(v);
          break;
        }
        case 'string': {
          const { key } = value;
          const v = { ...value, key };
          this.addStringOption(v);
          break;
        }
        case 'subCommand': {
          const { key } = value;
          const v = { ...value, key };
          this.addSubCommandOption(v);
          break;
        }
        case 'user': {
          const { key } = value;
          const v = { ...value, key };
          this.addUserOption(v);
          break;
        }
        default:
          throw new UnexpectedElseLogicalError(value);
      }
    });
  };

  /**
   * 引数のオプション（string型）を追加します。
   * @param arg オプションの情報
   * @returns this
   */
  addStringOption = (
    arg: Omit<CommandStringOption<'string', string, boolean>, 'key' | 'value'>,
  ): Omit<SetCommand<CommandBuilder>, 'addSubCommandOption'> => {
    this.command.addStringOption((op) => {
      const sc = SetCommand.setOptionBase(op, arg);
      if (arg.maxLength) {
        sc.setMaxLength(arg.maxLength);
      }
      if (arg.minLength) {
        sc.setMinLength(arg.minLength);
      }
      if (arg.choices) {
        sc.setChoices(...arg.choices);
      }
      if (arg.autoComplete) {
        sc.setAutocomplete(arg.autoComplete);
      }
      return sc;
    });
    return this;
  };

  /**
   * 引数のオプション（integer型）を追加します。
   * @param arg オプションの情報
   * @returns this
   */
  addIntegerOption = (
    arg: Omit<CommandIntegerOption<'integer', string, boolean>, 'key' | 'value'>,
  ): Omit<SetCommand<CommandBuilder>, 'addSubCommandOption'> => {
    this.command.addIntegerOption((op) => {
      const sc = SetCommand.setOptionBase(op, arg);
      if (arg.maxValue) {
        sc.setMaxValue(arg.maxValue);
      }
      if (arg.minValue) {
        sc.setMinValue(arg.minValue);
      }
      if (arg.choices) {
        sc.setChoices(...arg.choices);
      }
      if (arg.autoComplete) {
        sc.setAutocomplete(arg.autoComplete);
      }
      return sc;
    });
    return this;
  };

  /**
   * 引数のオプション（number型）を追加します。
   * @param arg オプションの情報
   * @returns this
   */
  addNumberOption = (
    arg: Omit<CommandNumberOption<'number', string, boolean>, 'key' | 'value'>,
  ): Omit<SetCommand<CommandBuilder>, 'addSubCommandOption'> => {
    this.command.addNumberOption((op) => {
      const sc = SetCommand.setOptionBase(op, arg);
      if (arg.maxValue) {
        sc.setMaxValue(arg.maxValue);
      }
      if (arg.minValue) {
        sc.setMinValue(arg.minValue);
      }
      if (arg.choices) {
        sc.setChoices(...arg.choices);
      }
      if (arg.autoComplete) {
        sc.setAutocomplete(arg.autoComplete);
      }
      return sc;
    });
    return this;
  };

  /**
   * 引数のオプション（boolean型）を追加します。
   * @param arg オプションの情報
   * @returns this
   */
  addBooleanOption = (
    arg: Omit<CommandBooleanOption<'boolean', string, boolean>, 'key' | 'value'>,
  ): Omit<SetCommand<CommandBuilder>, 'addSubCommandOption'> => {
    this.command.addBooleanOption((op) => {
      const sc = SetCommand.setOptionBase(op, arg);
      return sc;
    });
    return this;
  };

  /**
   * 引数のオプション（discord User型）を追加します。
   * @param arg オプションの情報
   * @returns this
   */
  addUserOption = (
    arg: Omit<CommandUserOption<'user', string, boolean>, 'key' | 'value'>,
  ): Omit<SetCommand<CommandBuilder>, 'addSubCommandOption'> => {
    this.command.addUserOption((op) => {
      const sc = SetCommand.setOptionBase(op, arg);
      return sc;
    });
    return this;
  };

  /**
   * 引数のオプション（discord Channel型）を追加します。
   * @param arg オプションの情報
   * @returns this
   */
  addChannelOption = (
    arg: Omit<CommandChannelOption<'channel', string, boolean>, 'key' | 'value'>,
  ): Omit<SetCommand<CommandBuilder>, 'addSubCommandOption'> => {
    this.command.addChannelOption((op) => {
      const sc = SetCommand.setOptionBase(op, arg);
      if (arg.channelType) {
        sc.addChannelTypes(...arg.channelType);
      }
      return sc;
    });
    return this;
  };

  /**
   * 引数のオプション（discord Role型）を追加します。
   * @param arg オプションの情報
   * @returns this
   */
  addRoleOption = (
    arg: Omit<CommandRoleOption<'role', string, boolean>, 'key' | 'value'>,
  ): Omit<SetCommand<CommandBuilder>, 'addSubCommandOption'> => {
    this.command.addRoleOption((op) => {
      const sc = SetCommand.setOptionBase(op, arg);
      return sc;
    });
    return this;
  };

  /**
   * 引数のオプション（discord Mentionable型）を追加します。
   * @param arg オプションの情報
   * @returns this
   */
  addMentionableOption = (
    arg: Omit<CommandMentionableOption<'mentionable', string, boolean>, 'key' | 'value'>,
  ): Omit<SetCommand<CommandBuilder>, 'addSubCommandOption'> => {
    this.command.addMentionableOption((op) => {
      const sc = SetCommand.setOptionBase(op, arg);
      return sc;
    });
    return this;
  };

  /**
   * 引数のオプション（discord Attachment型）を追加します。
   * @param arg オプションの情報
   * @returns this
   */
  addAttachmentOption = (
    arg: Omit<CommandAttachmentOption<'attachment', string, boolean>, 'key' | 'value'>,
  ): Omit<SetCommand<CommandBuilder>, 'addSubCommandOption'> => {
    this.command.addAttachmentOption((op) => {
      const sc = SetCommand.setOptionBase(op, arg);
      return sc;
    });
    return this;
  };

  // eslint-disable-next-line jsdoc/require-throws
  /**
   * 引数のオプション（discord Attachment型）を追加します。
   * @param arg オプションの情報
   * @returns this
   */
  addSubCommandOption = (
    arg:
      | Omit<SubCommandObject<string>, 'key'>
      | Omit<SetCommand<SlashCommandSubcommandBuilder>, 'addSubCommandOption'>,
  ): Omit<SetCommand<CommandBuilder>, `add${string}Option`> &
    Pick<SetCommand<CommandBuilder>, 'addSubCommandOption'> => {
    if (this.command instanceof SlashCommandSubcommandBuilder) {
      throw new UnexpectedElseLogicalError();
    }
    this.command.addSubcommand(() => {
      // Omitは呼ばないための見た目上の除外なので、asでキャストしている。
      const argT = arg as
        | Omit<SubCommandObject<string>, 'key'>
        | SetCommand<SlashCommandSubcommandBuilder>;
      if (argT instanceof SetCommand) {
        return argT.command;
      }
      const sc = SetCommand.createSubCommand({ key: 'subCommand', ...argT });
      return sc.command;
    });
    return this;
  };
}

export default SetCommand;
