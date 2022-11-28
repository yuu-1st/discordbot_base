import { ModalSubmitInteraction } from 'discord.js';
import { MessageAbleInteractionWrapper } from './MessageAbleInteractionWrapper.js';

/**
 * モーダル送信のInteractionのラッパークラスです。
 */
export class ModalSubmitInteractionWrapper extends MessageAbleInteractionWrapper {
  protected interaction: ModalSubmitInteraction;

  /**
   * コンストラクタ
   * @param interaction ModalSubmitInteraction
   * @param isClosed 返信を非公開にするかどうか
   */
  constructor(interaction: ModalSubmitInteraction, isClosed = true) {
    super(interaction, isClosed);
    this.interaction = interaction;
  }

  /**
   * 入力された文字列を取得する。
   * @param name カスタムID
   * @returns 入力された文字列
   * @throws Error 該当のカスタムIDが存在しない場合
   */
  getArgs = (name: string): string | undefined => this.interaction.fields.getTextInputValue(name);
}

export default ModalSubmitInteractionWrapper;
