/* eslint-disable max-classes-per-file */
import assert from 'assert';
import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  MentionableSelectMenuBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  UserSelectMenuBuilder,
} from 'discord.js';

type selectMenuOptionsType = {
  /** 表示するテキスト */
  label: string;
  /** 選択されたときに返される値 */
  value: string;
  /** 選択肢の説明 */
  description?: string;
  /** 選択肢の絵文字 */
  emoji?: string;
  /**
   * デフォルトの選択肢かどうか。
   * 注意：discordの仕様上、単一選択肢でonにすると、その選択肢を1回で押すことができなくなります。
   */
  default?: boolean;
};

type selectMenuArgsType = {
  /** カスタムID。インタラクション名 */
  id: string;
  /** プレースホルダーに表示するテキスト */
  placeholder: string;
  /** 入力できないようにするか */
  disabled?: boolean;
  /** 選択する最小数。入力するとユーザーが複数選択可能になります。 */
  minValues?: number;
  /** 選択する最大数。入力するとユーザーが複数選択可能になります。 */
  maxValues?: number;
};

abstract class SelectMenuGenerator<
  T extends
    | StringSelectMenuBuilder
    | UserSelectMenuBuilder
    | RoleSelectMenuBuilder
    | ChannelSelectMenuBuilder
    | MentionableSelectMenuBuilder,
> {
  public builder: T;

  constructor(instance: T, args: selectMenuArgsType | string, placeholder?: string) {
    this.builder = instance;
    if (typeof args === 'string') {
      assert(placeholder !== undefined, 'placeholderが指定されていません');
      this.builder.setCustomId(args).setPlaceholder(placeholder);
    } else {
      this.builder.setCustomId(args.id).setPlaceholder(args.placeholder);
      if (args.disabled) {
        this.builder.setDisabled();
      }
      if (args.minValues) {
        this.builder.setMinValues(args.minValues);
      }
      if (args.maxValues) {
        this.builder.setMaxValues(args.maxValues);
      }
    }
  }

  export = () => new ActionRowBuilder<T>().addComponents(this.builder);
}

/**
 * stringセレクトメニューを生成します
 */
export class StringSelectMenuGenerator extends SelectMenuGenerator<StringSelectMenuBuilder> {
  /**
   * セレクトメニューを生成します
   * @param id カスタムID。インタラクション名
   * @param placeholder プレースホルダーに表示するテキスト
   * @param options オプション
   */
  constructor(id: string, placeholder: string, options: selectMenuOptionsType[]);

  /**
   * セレクトメニューを生成します
   * @param args セレクトメニューの情報
   */
  constructor(
    args: selectMenuArgsType & {
      /** オプション */
      options: selectMenuOptionsType[];
    },
  );

  // eslint-disable-next-line jsdoc/require-param
  /**
   * セレクトメニューを生成します
   */
  constructor(
    args:
      | (selectMenuArgsType & {
          /** オプション */
          options: selectMenuOptionsType[];
        })
      | string,
    placeholder?: string,
    options?: selectMenuOptionsType[],
  ) {
    const builder = new StringSelectMenuBuilder();
    const arg = (() => {
      if (typeof args === 'string') {
        assert(placeholder !== undefined, 'placeholderが指定されていません');
        assert(options !== undefined, 'optionsが指定されていません');
        return { id: args, placeholder, options };
      }
      return args;
    })();
    super(builder, arg);
    options?.map((option) => this.addOption(option));
    if (typeof args !== 'string') {
      if (args.options) {
        args.options.map((option) => this.addOption(option));
      }
      if (args.disabled) {
        this.builder.setDisabled();
      }
      if (args.minValues) {
        this.builder.setMinValues(args.minValues);
      }
      if (args.maxValues) {
        this.builder.setMaxValues(args.maxValues);
      }
    }
  }

  /**
   * セレクトメニューのオプションを追加します
   * @param option オプション
   * @returns this
   */
  addOption = (option: selectMenuOptionsType): StringSelectMenuGenerator => {
    const stringOption = new StringSelectMenuOptionBuilder()
      .setLabel(option.label)
      .setValue(option.value);
    if (option.description) {
      stringOption.setDescription(option.description);
    }
    if (option.emoji) {
      stringOption.setEmoji(option.emoji);
    }
    if (option.default) {
      stringOption.setDefault();
    }
    this.builder.addOptions(stringOption);
    return this;
  };
}

/**
 * userセレクトメニューを生成します
 */
export class UserSelectMenuGenerator extends SelectMenuGenerator<UserSelectMenuBuilder> {
  /**
   * セレクトメニューを生成します
   * @param id カスタムID。インタラクション名
   * @param placeholder プレースホルダーに表示するテキスト
   */
  constructor(id: string, placeholder: string);

  /**
   * セレクトメニューを生成します
   * @param args セレクトメニューの情報
   */
  constructor(args: selectMenuArgsType);

  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(args: selectMenuArgsType | string, placeholder?: string) {
    const builder = new UserSelectMenuBuilder();
    super(builder, args, placeholder);
  }
}

/**
 * roleセレクトメニューを生成します
 */
export class RoleSelectMenuGenerator extends SelectMenuGenerator<RoleSelectMenuBuilder> {
  /**
   * セレクトメニューを生成します
   * @param id カスタムID。インタラクション名
   * @param placeholder プレースホルダーに表示するテキスト
   */
  constructor(id: string, placeholder: string);

  /**
   * セレクトメニューを生成します
   * @param args セレクトメニューの情報
   */
  constructor(args: selectMenuArgsType);

  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(args: selectMenuArgsType | string, placeholder?: string) {
    const builder = new RoleSelectMenuBuilder();
    super(builder, args, placeholder);
  }
}

/**
 * channelセレクトメニューを生成します
 */
export class ChannelSelectMenuGenerator extends SelectMenuGenerator<ChannelSelectMenuBuilder> {
  /**
   * セレクトメニューを生成します
   * @param id カスタムID。インタラクション名
   * @param placeholder プレースホルダーに表示するテキスト
   */
  constructor(id: string, placeholder: string);

  /**
   * セレクトメニューを生成します
   * @param args セレクトメニューの情報
   */
  constructor(args: selectMenuArgsType & { channelTypes?: ChannelType[] });

  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(
    args: (selectMenuArgsType & { channelTypes?: ChannelType[] }) | string,
    placeholder?: string,
  ) {
    const builder = new ChannelSelectMenuBuilder();
    super(builder, args, placeholder);
    if (typeof args !== 'string') {
      if (args.channelTypes) {
        this.builder.addChannelTypes(args.channelTypes);
      }
    }
  }
}

/**
 * mentionableセレクトメニューを生成します
 */
// eslint-disable-next-line max-len
export class MentionableSelectMenuGenerator extends SelectMenuGenerator<MentionableSelectMenuBuilder> {
  /**
   * セレクトメニューを生成します
   * @param id カスタムID。インタラクション名
   * @param placeholder プレースホルダーに表示するテキスト
   */
  constructor(id: string, placeholder: string);

  /**
   * セレクトメニューを生成します
   * @param args セレクトメニューの情報
   */
  constructor(args: selectMenuArgsType);

  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(args: selectMenuArgsType | string, placeholder?: string) {
    const builder = new MentionableSelectMenuBuilder();
    super(builder, args, placeholder);
  }
}
