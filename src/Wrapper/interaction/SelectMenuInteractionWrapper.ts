import { StringSelectMenuInteraction } from 'discord.js';
import { MessageAbleInteractionWrapper } from './MessageAbleInteractionWrapper.js';

/**
 * ボタンのInteractionのラッパークラスです。
 */
export class SelectMenuInteractionWrapper extends MessageAbleInteractionWrapper {
  protected interaction: StringSelectMenuInteraction;

  /**
   * コンストラクタ
   * @param interaction ButtonInteraction
   * @param isClosed 返信を非公開にするかどうか
   */
  constructor(interaction: StringSelectMenuInteraction, isClosed = true) {
    super(interaction, isClosed);
    this.interaction = interaction;
  }

  /** @returns 引数を取得します */
  getArgs = () => [...this.interaction.values];
}

export default SelectMenuInteractionWrapper;
