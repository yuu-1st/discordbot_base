import { InteractionReplyOptions, ButtonInteraction, ChatInputCommandInteraction, ModalSubmitInteraction, StringSelectMenuInteraction } from 'discord.js';

export type InteractionReplyMessage = {
  /** 送信するメッセージ */
  message: string;
  /** コンポーネント */
  components?: InteractionReplyOptions['components']
  // (MessageActionRow |
  //   (Required<BaseMessageComponentOptions> & MessageActionRowOptions))[];
  /** 送信ラグ。0番目は0であることを推奨します */
  delay?: number;
}

export type MessageAbleInteractionType =
  | ChatInputCommandInteraction
  | ButtonInteraction
  | StringSelectMenuInteraction
  | ModalSubmitInteraction;
