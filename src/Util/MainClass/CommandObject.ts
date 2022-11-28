import {
  APIRole,
  ApplicationCommandOptionAllowedChannelTypes,
  Attachment,
  CommandInteractionOption,
  Role,
  User,
} from 'discord.js';
import { UnexpectedElseLogicalError } from '../../Error/LogicalError.js';
import ChatInputCommandInteractionWrapper from '../../Wrapper/interaction/ChatInputCommandInteractionWrapper.js';

export type KeyList =
  | 'string'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'user'
  | 'channel'
  | 'role'
  | 'mentionable'
  | 'attachment';

export interface CommandOptionBase<
  Key extends KeyList,
  Name extends string,
  Require extends boolean,
> {
  /** ユーザーが引数として入力する型を指定します */
  key: Key;
  /** 英数字(小文字のみ)、`_`および`-`からなる1〜32文字。(日本語も可？) */
  name: Name;
  /** 引数の説明。1文字以上100文字以内 */
  description: string;
  /** この引数が必須かどうか。falseを選択した場合、引数は省略可能になり、nullが渡される場合があります。 */
  require: Require;
  /** 入力されたデータ */
  // value: unknown;
}

export interface CommandStringOption<K extends 'string', N extends string, R extends boolean>
  extends CommandOptionBase<K, N, R> {
  autoComplete?: boolean;
  maxLength?: number;
  minLength?: number;
  choices?: { name: string; value: string }[];
  value: R extends true ? string : string | null;
}

export interface CommandIntegerOption<K extends 'integer', N extends string, R extends boolean>
  extends CommandOptionBase<K, N, R> {
  autoComplete?: boolean;
  maxValue?: number;
  minValue?: number;
  choices?: { name: string; value: number }[];
  value: R extends true ? number : number | null;
}

export interface CommandNumberOption<K extends 'number', N extends string, R extends boolean>
  extends CommandOptionBase<K, N, R> {
  autoComplete?: boolean;
  maxValue?: number;
  minValue?: number;
  choices?: { name: string; value: number }[];
  value: R extends true ? number : number | null;
}

export interface CommandBooleanOption<K extends 'boolean', N extends string, R extends boolean>
  extends CommandOptionBase<K, N, R> {
  value: R extends true ? boolean : boolean | null;
}

export interface CommandUserOption<K extends 'user', N extends string, R extends boolean>
  extends CommandOptionBase<K, N, R> {
  value: R extends true ? User : User | null;
}

export interface CommandChannelOption<K extends 'channel', N extends string, R extends boolean>
  extends CommandOptionBase<K, N, R> {
  channelType?: ApplicationCommandOptionAllowedChannelTypes[];
  value: R extends true
    ? NonNullable<CommandInteractionOption['channel']>
    : NonNullable<CommandInteractionOption['channel']> | null;
}

export interface CommandRoleOption<K extends 'role', N extends string, R extends boolean>
  extends CommandOptionBase<K, N, R> {
  value: R extends true ? Role | APIRole : Role | APIRole | null;
}

export interface CommandMentionableOption<
  K extends 'mentionable',
  N extends string,
  R extends boolean,
> extends CommandOptionBase<K, N, R> {
  value: R extends true
    ? NonNullable<CommandInteractionOption['member' | 'role' | 'user']>
    : NonNullable<CommandInteractionOption['member' | 'role' | 'user']> | null;
}

export interface CommandAttachmentOption<
  K extends 'attachment',
  N extends string,
  R extends boolean,
> extends CommandOptionBase<K, N, R> {
  value: R extends true ? Attachment : Attachment | null;
}

export type RequireValueCommandOption<
  K extends KeyList,
  N extends string,
  R extends boolean,
> = K extends 'string'
  ? CommandStringOption<K, N, R>
  : K extends 'integer'
  ? CommandIntegerOption<K, N, R>
  : K extends 'number'
  ? CommandNumberOption<K, N, R>
  : K extends 'boolean'
  ? CommandBooleanOption<K, N, R>
  : K extends 'user'
  ? CommandUserOption<K, N, R>
  : K extends 'channel'
  ? CommandChannelOption<K, N, R>
  : K extends 'role'
  ? CommandRoleOption<K, N, R>
  : K extends 'mentionable'
  ? CommandMentionableOption<K, N, R>
  : K extends 'attachment'
  ? CommandAttachmentOption<K, N, R>
  : never;

export type CommandOption<K extends KeyList, S extends string, R extends boolean> = Omit<
  RequireValueCommandOption<K, S, R>,
  'value'
>;

export interface SubCommandObject<Name extends string> {
  /** subCommandを生成する。同配列内は全てsubCommandをkeyとする必要があります。 */
  key: 'subCommand';
  /** 英数字(小文字のみ)、`_`および`-`からなる1〜32文字。(日本語も可？) */
  name: Name;
  /** コマンドの説明。1文字以上100文字以内 */
  description: string;
  /** 引数指定。 */
  option?: readonly CommandOption<KeyList, string, boolean>[];
}

/**
 * ChatInputCommandのコマンドを作成するためのベースとなるinterface。
 * このinterfaceは、オブジェクトの後ろに"as const satisfies CommandObject"をつけて記述する必要があります。
 * @example <caption>最小限のChatInputCommand</caption>
 * const command = {
 *   name: 'slash-command',
 *   description: 'This is test slash command.',
 * } as const satisfies CommandObject;
 */
export interface CommandObject<K extends KeyList | 'subCommand' = KeyList | 'subCommand'> {
  /** 英数字(小文字のみ)、`_`および`-`からなる1〜32文字。(日本語も可？) */
  name: string;
  /** コマンドの説明。1文字以上100文字以内 */
  description: string;
  /**
   * 引数指定。
   *
   * CommandOptionを使用する場合は、型の都合上、エラーが予期せぬ位置に表示されることがあります。
   * key, name, description, requireの最低4種類のプロパティを全てに記述しているか確認してください。
   */
  readonly option?: K extends 'subCommand'
    ? readonly SubCommandObject<string>[]
    : K extends KeyList
    ? readonly CommandOption<K, string, boolean>[]
    : never;
}

// ここからCommandObjectを引数Argsへ変換するための型

type GetOptionValue<
  K extends KeyList,
  S extends string,
  B extends boolean,
> = RequireValueCommandOption<K, S, B>['value'];

type ConvertCommandOptionToObject<K extends KeyList, N extends string, R extends boolean> = {
  [key in N]: { key: K; name: N; require: R; value: GetOptionValue<K, N, R> };
};

type WrapperConvertCommandOptionToObject<C extends CommandOption<KeyList, string, boolean>> =
  C extends {
    key: infer T extends KeyList;
    name: infer N extends string;
    description: string;
    require: infer R extends boolean;
  }
    ? C extends CommandOption<KeyList, string, boolean>
      ? ConvertCommandOptionToObject<T, N, R>
      : C
    : C;

type ConvertCommandObjectArrayToObject<C extends readonly any[]> = C extends readonly [
  infer R extends CommandOption<KeyList, string, boolean>,
  ...infer E,
]
  ? WrapperConvertCommandOptionToObject<R> & ConvertCommandObjectArrayToObject<E>
  : C extends []
  ? {}
  : never;

type ConvertSubCommandObjectToObjectInOptions<
  N extends string,
  O extends readonly CommandOption<KeyList, string, boolean>[],
> = {
  [key in N]?: ConvertCommandObjectArrayToObject<O>;
};

type WrapperConvertSubCommandObjectToObjectInOptions<C extends SubCommandObject<string>> =
  C extends {
    name: infer N extends string;
    option: infer R extends readonly CommandOption<KeyList, string, boolean>[];
  }
    ? ConvertSubCommandObjectToObjectInOptions<N, R>
    : {};

type ConvertSubCommandObjectArrayToArgsObject<C extends readonly any[]> = C extends readonly [
  infer R extends SubCommandObject<string>,
  ...infer E,
]
  ? WrapperConvertSubCommandObjectToObjectInOptions<R> & ConvertSubCommandObjectArrayToArgsObject<E>
  : C extends []
  ? {}
  : never;

export type ConvertCommandObjectToArgs<C extends CommandObject> =
  C['option'] extends infer O extends readonly CommandOption<KeyList, string, boolean>[]
    ? ConvertCommandObjectArrayToObject<O>
    : C['option'] extends infer P extends readonly SubCommandObject<string>[]
    ? ConvertSubCommandObjectArrayToArgsObject<P>
    : {};

// ここからCommandObjectを引数Argsへ変換するための関数

const getValueFromCommandOption = <K extends KeyList, S extends string, B extends boolean>(
  key: K,
  name: S,
  require: B,
  interaction: ChatInputCommandInteractionWrapper,
): GetOptionValue<K, S, B> => {
  switch (key) {
    case 'attachment': {
      if (require === true) {
        return interaction.getArgs.AttachmentRequired(name);
      }
      return interaction.getArgs.Attachment(name) as GetOptionValue<K, S, B>;
    }
    case 'boolean':
      if (require === true) {
        return interaction.getArgs.BooleanRequired(name);
      }
      return interaction.getArgs.Boolean(name) as GetOptionValue<K, S, B>;
    case 'channel':
      if (require === true) {
        return interaction.getArgs.ChannelRequired(name);
      }
      return interaction.getArgs.Channel(name) as GetOptionValue<K, S, B>;
    case 'integer':
      if (require === true) {
        return interaction.getArgs.IntegerRequired(name);
      }
      return interaction.getArgs.Integer(name) as GetOptionValue<K, S, B>;
    case 'mentionable':
      if (require === true) {
        return interaction.getArgs.MentionableRequired(name);
      }
      return interaction.getArgs.Mentionable(name) as GetOptionValue<K, S, B>;
    case 'number':
      if (require === true) {
        return interaction.getArgs.NumberRequired(name);
      }
      return interaction.getArgs.Number(name) as GetOptionValue<K, S, B>;
    case 'role':
      if (require === true) {
        return interaction.getArgs.RoleRequired(name);
      }
      return interaction.getArgs.Role(name) as GetOptionValue<K, S, B>;
    case 'string':
      if (require === true) {
        return interaction.getArgs.StringRequired(name);
      }
      return interaction.getArgs.String(name) as GetOptionValue<K, S, B>;
    case 'user':
      if (require === true) {
        return interaction.getArgs.UserRequired(name);
      }
      return interaction.getArgs.User(name) as GetOptionValue<K, S, B>;
    default:
      throw new UnexpectedElseLogicalError(key);
  }
};

/* eslint-disable indent */

const createCommandOptionToObject = <
  O extends CommandOption<K, S, B>,
  K extends KeyList,
  S extends string,
  B extends boolean,
>(
  option: O,
  interaction: ChatInputCommandInteractionWrapper,
): ConvertCommandOptionToObject<K, S, B> => {
  const { name, require }: { name: S; require: B } = option;
  const { key } = option as unknown as { key: K }; // TODO: as unknownの削除
  const obj = {
    key,
    name,
    require,
    value: getValueFromCommandOption(key, name, require, interaction),
  };
  const ret = {} as ConvertCommandOptionToObject<K, S, B>;
  ret[name] = obj;
  return ret;
};

export const createCommandOptionsToObject = <
  O extends readonly CommandOption<KeyList, string, boolean>[],
>(
  option: O,
  interaction: ChatInputCommandInteractionWrapper,
): ConvertCommandObjectArrayToObject<O> => {
  let obj = {} as ConvertCommandObjectArrayToObject<O>;
  option.map((v) => {
    obj = {
      ...obj,
      ...createCommandOptionToObject<typeof v, KeyList, string, boolean>(v, interaction),
    };
    return v.name;
  });
  return obj;
};

const createSubCommandObjectToObject = <
  S extends SubCommandObject<G>,
  G extends string,
  O extends readonly CommandOption<KeyList, string, boolean>[],
>(
  option: S,
  interaction: ChatInputCommandInteractionWrapper,
): ConvertSubCommandObjectToObjectInOptions<G, O> => {
  const commandOption = option.option;
  const { name }: { name: G } = option;
  if (commandOption) {
    const ret = {} as ConvertSubCommandObjectToObjectInOptions<G, O>;
    ret[name] = createCommandOptionsToObject(commandOption, interaction);
    return ret;
  }
  const ret = {} as ConvertSubCommandObjectToObjectInOptions<G, O>;
  ret[name] = {} as ConvertCommandObjectArrayToObject<O>;
  return ret;
};

export const createSubCommandObjectsToObject = <O extends readonly SubCommandObject<string>[]>(
  option: O,
  interaction: ChatInputCommandInteractionWrapper,
): ConvertSubCommandObjectArrayToArgsObject<O> => {
  let obj = {} as ConvertSubCommandObjectArrayToArgsObject<O>;
  option.map((v) => {
    if (v.name === interaction.getArgs.SubcommandRequired()) {
      obj = {
        ...obj,
        ...createSubCommandObjectToObject<
          typeof v,
          string,
          Exclude<(typeof v)['option'], undefined>
        >(v, interaction),
      };
    }
    return v.name;
  });
  return obj;
};

/* eslint-enable indent */
