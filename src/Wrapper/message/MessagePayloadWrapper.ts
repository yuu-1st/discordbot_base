import { BaseMessageOptions, MessagePayloadOption } from 'discord.js';

/**
 * メッセージ送信するオブジェクトを作成します。
 */
class MessagePayloadOptionWrapper<T extends MessagePayloadOption> {
  option: T;

  delay: number;

  /**
   * コンストラクタ
   * @param message 送信するメッセージ。content
   * @param option その他付加情報。※contentはmessage引数で上書きされます。
   * @param delay 遅延時間。この数値が使用されるかはwrapperの仕様によります。
   */
  constructor(message: string, option: T, delay?: number) {
    this.option = option;
    this.option.content = message;
    this.delay = delay ?? 0;
  }

  /**
   * BaseMessageOptions基準でインスタンスを生成します。
   * メッセージだけ送る時用
   * @param message 送信するメッセージ
   * @param delay 遅延時間。この数値が使用されるかはwrapperの仕様によります。
   * @returns インスタンス
   */
  static createBase = (message: string, delay?: number) => {
    const instance = new MessagePayloadOptionWrapper<BaseMessageOptions>(message, {}, delay);
    return instance;
  };

  /**
   * embedsを追加します。
   * @param embeds 追加するembeds
   */
  addEmbeds = (embeds: NonNullable<BaseMessageOptions['embeds']>) => {
    if (this.option.embeds) {
      this.option.embeds.push(...embeds);
    } else {
      this.option.embeds = embeds;
    }
  };

  /**
   * componentsを追加します。
   * @param components 追加するcomponents
   */
  addComponents = (components: NonNullable<BaseMessageOptions['components']>) => {
    if (this.option.components) {
      this.option.components.push(...components);
    } else {
      this.option.components = components;
    }
  };

  /**
   * 作成されたオブジェクトを出力します。
   * @returns 作成されたオブジェクト
   */
  export = (): T => ({ ...this.option });
}

export default MessagePayloadOptionWrapper;
