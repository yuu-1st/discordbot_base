import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

/**
 * ボタンを生成します
 */
class ButtonGenerator {
  public builder = new ButtonBuilder();

  private connectButton: ButtonGenerator[] = [];

  /**
   * ボタンを生成します
   * @param id カスタムID。インタラクション名
   * @param label ボタンに表示するテキスト
   * @param style ボタンのスタイル。デフォルトはPrimary
   */
  constructor(id: string, label: string, style?: ButtonStyle);

  /**
   * ボタンを生成します
   * @param args ボタンの情報
   */
  constructor(args: {
    /** カスタムID。インタラクション名 */
    id: string;
    /** ボタンに表示するテキスト */
    label: string;
    /** ボタンのスタイル。デフォルトはPrimary */
    style?: ButtonStyle;
  });

  /**
   * ボタンを生成します
   * @param args ボタンの情報もしくはカスタムID。インタラクション名
   * @param label ボタンに表示するテキスト
   * @param style ボタンのスタイル。デフォルトはPrimary
   */
  constructor(
    args: { id: string; label: string; style?: ButtonStyle } | string,
    label?: string,
    style?: ButtonStyle,
  ) {
    if (typeof args === 'string') {
      this.builder
        .setCustomId(args)
        .setLabel(label ?? args)
        .setStyle(style ?? ButtonStyle.Primary);
    } else {
      this.builder
        .setCustomId(args.id)
        .setLabel(args.label)
        .setStyle(args.style ?? ButtonStyle.Primary);
    }
  }

  /**
   * ボタンを同じ行に追加します。
   *
   * 注意: 呼び出された側のボタンにconnectされたボタンは、追加されません。
   * 3つ以上のボタンを追加する場合は、一番左のボタンにこのメソッドを複数回呼び出してください。
   * @param button 右側に追加するボタン
   * @returns this
   */
  connect = (button: ButtonGenerator) => {
    this.connectButton.push(button);
    return this;
  };

  /**
   * 生成したボタンを返します。
   * @returns ActionRowBuilderで生成されたボタン
   */
  export = (): ActionRowBuilder<ButtonBuilder> => {
    const builder = new ActionRowBuilder<ButtonBuilder>();
    builder.addComponents(this.builder);
    this.connectButton.forEach((button) => {
      builder.addComponents(button.builder);
    });
    return builder;
  };
}

export default ButtonGenerator;
