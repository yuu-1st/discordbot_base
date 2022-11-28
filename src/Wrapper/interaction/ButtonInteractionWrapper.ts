import { ButtonInteraction } from 'discord.js';
import { MessageAbleInteractionWrapper } from './MessageAbleInteractionWrapper.js';

/**
 * ボタンのInteractionのラッパークラスです。
 */
export class ButtonInteractionWrapper extends MessageAbleInteractionWrapper {
  protected interaction: ButtonInteraction;

  /**
   * コンストラクタ
   * @param interaction ButtonInteraction
   * @param isClosed 返信を非公開にするかどうか
   */
  constructor(interaction: ButtonInteraction, isClosed = true) {
    super(interaction, isClosed);
    this.interaction = interaction;
  }
}

export default ButtonInteractionWrapper;
