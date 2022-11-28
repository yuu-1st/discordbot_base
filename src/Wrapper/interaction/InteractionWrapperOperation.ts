import { Interaction } from 'discord.js';
import AutoCompleteInteractionWrapper from './AutoCompleteInteractionWrapper.js';
import ButtonInteractionWrapper from './ButtonInteractionWrapper.js';
import ChatInputCommandInteractionWrapper from './ChatInputCommandInteractionWrapper.js';
import { MessageAbleInteractionWrapper } from './MessageAbleInteractionWrapper.js';
import ModalSubmitInteractionWrapper from './ModalSubmitInteractionWrapper.js';
import SelectMenuInteractionWrapper from './SelectMenuInteractionWrapper.js';
import InteractionWrapper from './interactionWrapper.js';

/**
 * InteractionWrapperと、その拡張クラスを管理するクラス。
 * (InteractionWrapperに内蔵する予定だったが、ファイルを分けることによって循環参照が生じ、
 * コードが実行できなくなったため、専用クラスに分割)
 */
class InteractionWrapperOperation {
  /**
   * interactionの種類に応じたInteractionWrapperに格納し、Wrapperを返します。
   * @param interaction wrapperするinteraction
   * @returns InteractionWrapper
   */
  static CreateWrapper = (interaction: Interaction): InteractionWrapper => {
    if (interaction.isAutocomplete()) {
      return new AutoCompleteInteractionWrapper(interaction);
    }
    if (interaction.isChatInputCommand()) {
      return new ChatInputCommandInteractionWrapper(interaction);
    }
    if (interaction.isButton()) {
      return new ButtonInteractionWrapper(interaction);
    }
    if (interaction.isStringSelectMenu()) {
      return new SelectMenuInteractionWrapper(interaction);
    }
    if (interaction.isModalSubmit()) {
      return new ModalSubmitInteractionWrapper(interaction);
    }
    // デフォルトラッパーを返す(もしくはエラー)
    return new InteractionWrapper(interaction);
  };

  /**
   * 渡されたInteractionWrapperがautoComplete型かどうかをチェックします。
   * @param interactionWrapper チェックするInteractionWrapper
   * @returns is演算子
   */
  static isAutoComplete = (
    interactionWrapper: InteractionWrapper,
  ): interactionWrapper is AutoCompleteInteractionWrapper => {
    if (interactionWrapper instanceof AutoCompleteInteractionWrapper) {
      return true;
    }
    return false;
  };

  /**
   * 渡されたInteractionWrapperがbutton型かどうかをチェックします。
   * @param interactionWrapper チェックするInteractionWrapper
   * @returns is演算子
   */
  static isButton = (
    interactionWrapper: InteractionWrapper,
  ): interactionWrapper is ButtonInteractionWrapper => {
    if (interactionWrapper instanceof ButtonInteractionWrapper) {
      return true;
    }
    return false;
  };

  /**
   * 渡されたInteractionWrapperがchatInputCommand型かどうかをチェックします。
   * @param interactionWrapper チェックするInteractionWrapper
   * @returns is演算子
   */
  static isChatInputCommand = (
    interactionWrapper: InteractionWrapper,
  ): interactionWrapper is ChatInputCommandInteractionWrapper => {
    if (interactionWrapper instanceof ChatInputCommandInteractionWrapper) {
      return true;
    }
    return false;
  };

  /**
   * 渡されたInteractionWrapperがmodalSubmit型かどうかをチェックします。
   * @param interactionWrapper チェックするInteractionWrapper
   * @returns is演算子
   */
  static isModalSubmit = (
    interactionWrapper: InteractionWrapper,
  ): interactionWrapper is ModalSubmitInteractionWrapper => {
    if (interactionWrapper instanceof ModalSubmitInteractionWrapper) {
      return true;
    }
    return false;
  };

  /**
   * 渡されたInteractionWrapperがselectMenu型かどうかをチェックします。
   * @param interactionWrapper チェックするInteractionWrapper
   * @returns is演算子
   */
  static isSelectMenu = (
    interactionWrapper: InteractionWrapper,
  ): interactionWrapper is SelectMenuInteractionWrapper => {
    if (interactionWrapper instanceof SelectMenuInteractionWrapper) {
      return true;
    }
    return false;
  };

  /**
   * 渡されたInteractionWrapperがmessageAble型に含まれるかどうかをチェックします。
   * @param interactionWrapper チェックするInteractionWrapper
   * @returns is演算子
   */
  static isMessageAble = (
    interactionWrapper: InteractionWrapper,
  ): interactionWrapper is MessageAbleInteractionWrapper => {
    if (interactionWrapper instanceof MessageAbleInteractionWrapper) {
      return true;
    }
    return false;
  };
}

export default InteractionWrapperOperation;
