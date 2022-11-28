import assert from 'assert';
import {
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

type addTextInputType = {
  /**
   * モーダルにテキストを追加します。
   * @param textId テキストのID
   * @param label テキストのラベル。上部に表示されます
   * @param placeholder テキストのプレースホルダー。入力欄に表示されます
   * @param style テキストのスタイル。デフォルトはShort
   */
  (textId: string, label: string, placeholder?: string, style?: TextInputStyle): ModalGenerator;
  /**
   * モーダルにテキストを追加します。
   * @param args テキストの情報
   */
  (args: {
    /** テキストのID */
    textId: string;
    /** テキストのラベル。上部に表示されます */
    label: string;
    /** テキストのプレースホルダー。入力欄に表示されます */
    placeholder?: string;
    /** テキストのスタイル。デフォルトはShort */
    style?: TextInputStyle;
    /** テキストの最小文字数 */
    minLength?: number;
    /** テキストの最大文字数 */
    maxLength?: number;
    /** 必須かどうか */
    required?: boolean;
    /** デフォルトで入力されているテキスト */
    defaultValue?: string;
  }): ModalGenerator;
};

/**
 * モーダルを生成します。
 */
class ModalGenerator {
  public builder = new ModalBuilder();

  /**
   * モーダルを生成します。
   * @param id カスタムID。インタラクション名
   * @param title モーダルのタイトル
   */
  constructor(id: string, title: string);

  /**
   * モーダルを生成します。
   * @param args モーダルの情報
   */
  constructor(args: {
    /** カスタムID。インタラクション名 */
    id: string;
    /** モーダルのタイトル */
    title: string;
  });

  // eslint-disable-next-line jsdoc/require-param
  /**
   * モーダルを生成します。
   */
  constructor(args: { id: string; title: string } | string, title?: string) {
    if (typeof args === 'string') {
      this.builder.setCustomId(args);
      this.builder.setTitle(title ?? args);
    } else {
      this.builder.setCustomId(args.id);
      this.builder.setTitle(args.title);
    }
  }

  /**
   * モーダルにテキストを追加します。
   * @param args テキストの情報
   * @returns this
   */
  addTextInput: addTextInputType = (...args: unknown[]) => {
    assert(args[0] !== null, '引数がnullです');
    if (typeof args[0] === 'string') {
      assert(args.length === 4, '引数の数が違います');
      assert(typeof args[0] === 'string', '引数0の型が違います');
      assert(typeof args[1] === 'string', '引数1の型が違います');
      assert(typeof args[2] === 'string' || args[2] === undefined, '引数2の型が違います');
      assert(typeof args[3] === 'number' || args[3] === undefined, '引数3の型が違います');
      const textInput = new TextInputBuilder()
        .setCustomId(args[0])
        .setLabel(args[1])
        .setStyle(args[3] ?? TextInputStyle.Short);
      if (args[2]) {
        textInput.setPlaceholder(args[2]);
      }
      const textInputBuilder = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        textInput,
      );
      this.builder.addComponents(textInputBuilder);
    } else if (typeof args[0] === 'object') {
      const arg = args[0];
      assert('textId' in arg && typeof arg.textId === 'string', '引数textIdの型が違います');
      assert('label' in arg && typeof arg.label === 'string', '引数labelの型が違います');
      assert(
        'placeholder' in arg &&
          (typeof arg.placeholder === 'string' || arg.placeholder === undefined),
        '引数placeholderの型が違います',
      );
      assert(
        'style' in arg && (typeof arg.style === 'number' || arg.style === undefined),
        '引数styleの型が違います',
      );
      const textInput = new TextInputBuilder()
        .setCustomId(arg.textId)
        .setLabel(arg.label)
        .setStyle(arg.style ?? TextInputStyle.Short);
      if (arg.placeholder) {
        textInput.setPlaceholder(arg.placeholder);
      }
      if ('minLength' in arg) {
        assert(typeof arg.minLength === 'number', '引数minLengthの型が違います');
        textInput.setMinLength(arg.minLength);
      }
      if ('maxLength' in arg) {
        assert(typeof arg.maxLength === 'number', '引数maxLengthの型が違います');
        textInput.setMaxLength(arg.maxLength);
      }
      if ('required' in arg) {
        assert(typeof arg.required === 'boolean', '引数requiredの型が違います');
        textInput.setRequired(arg.required);
      }
      if ('defaultValue' in arg) {
        assert(typeof arg.defaultValue === 'string', '引数defaultValueの型が違います');
        textInput.setValue(arg.defaultValue);
      }
      const textInputBuilder = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        textInput,
      );
      this.builder.addComponents(textInputBuilder);
    }
    return this;
  };

  export = (): ModalBuilder => this.builder;
}

export default ModalGenerator;
