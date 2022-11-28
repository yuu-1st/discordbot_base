import { InteractionReplyOptions, ModalBuilder } from 'discord.js';
import {
  ActionAlreadyExecutedFailedAddRuntimeError,
  InappropriateInteractionLogicalError,
  MessageAlreadySentRuntimeError,
  SendFailedWrappedError,
} from '../../Error/index.js';
import { DiscordMessage } from '../../Util/ConsoleMessages.js';
import { sleep } from '../../Util/Objects.js';
import { MessageAbleInteractionType } from '../@types/InteractionReplyMessage';
import MessagePayloadOptionWrapper from '../message/MessagePayloadWrapper.js';
import InteractionWrapper from './interactionWrapper.js';

type addMessageType = {
  (...message: MessagePayloadOptionWrapper<InteractionReplyOptions>[]): void;
  (...args: Parameters<typeof MessagePayloadOptionWrapper.createBase>): void;
};

/**
 * メッセージを送信できるinteractionのラッパーです。
 */
export class MessageAbleInteractionWrapper extends InteractionWrapper {
  protected interaction: MessageAbleInteractionType;

  /** 返信を非公開にするか */
  private isClosed: boolean;

  /** 返信を遅延させたかどうか */
  private isDeferReply: boolean = false;

  /** 返信を送信したかどうか */
  private isReply: boolean = false;

  /** modal用 */
  private modal: ModalBuilder | null = null;

  /** 送信する予定のメッセージリスト */
  protected messages: MessagePayloadOptionWrapper<InteractionReplyOptions>[] = [];

  protected constructor(interaction: MessageAbleInteractionType, isClosed = true) {
    super(interaction);
    this.interaction = interaction;
    this.isClosed = isClosed;
  }

  /**
   * メッセージ返信を遅延します。
   * discordの仕様である3秒から15分まで延長できますが、メッセージ以外は送信できなくなります。
   * @param waitMessage 遅延する際に表示するメッセージ
   * @returns null
   */
  deferReply = async (waitMessage: string | null = null): Promise<void> => {
    if (this.isDeferReply) {
      return;
    }
    this.isDeferReply = true;
    if (waitMessage) {
      await this.interaction.reply({ content: waitMessage, ephemeral: this.isClosed });
    } else {
      await this.interaction.deferReply({ ephemeral: this.isClosed });
    }
  };

  /**
   * 送信するメッセージを追加します
   * @param param 送信するメッセージ
   */
  addMessage: addMessageType = (...param): void => {
    const argsCheck = (
      key: unknown[],
    ): key is Parameters<typeof MessagePayloadOptionWrapper.createBase> => {
      if (key[0] instanceof MessagePayloadOptionWrapper) {
        return false;
      }
      return true;
    };
    if (typeof param[0] === 'undefined') {
      return;
    }
    if (argsCheck(param)) {
      this.messages.push(MessagePayloadOptionWrapper.createBase(...param));
    } else {
      this.messages.push(...(param as MessagePayloadOptionWrapper<InteractionReplyOptions>[]));
    }
  };

  /**
   * 送信するModalを追加します。
   * @param modal 送信するmodal
   * @throws ActionAlreadyExecutedFailedAddRuntimeError deferReplyを実行した後に追加する場合
   * @throws InappropriateInteractionLogicalError ModalSubmitInteractionで実行した場合
   */
  addModal = (modal: ModalBuilder): void => {
    if (this.isDeferReply || this.isReply) {
      // deferReplyが実行されている場合は、エラーを返す
      throw new ActionAlreadyExecutedFailedAddRuntimeError('deferReply', 'Modal');
    } else if (!this.interaction.isModalSubmit()) {
      this.modal = modal;
      return;
    }
    // ModalSubmitInteractionにaddModalが存在しないため、エラーを返す
    throw new InappropriateInteractionLogicalError('ModalSubmitInteraction');
  };

  /**
   * 単一のメッセージをdiscordに送信します。
   * @param message 送信するメッセージ
   * @throws SendFailedWrappedError 送信に失敗した時
   */
  private sendMessageToDiscord = async (
    message: MessagePayloadOptionWrapper<InteractionReplyOptions>,
  ): Promise<void> => {
    // eslint-disable-next-line no-param-reassign
    message.option.ephemeral = this.isClosed;
    if (this.isReply) {
      // 追加で送信する
      await this.interaction.followUp(message.export()).catch((err) => {
        throw new SendFailedWrappedError(err, `${err.message}\n${err.stack}`);
      });
    } else if (this.isDeferReply) {
      // 追加で送信する
      await this.interaction.editReply(message.export()).catch((err) => {
        throw new SendFailedWrappedError(err, `${err.message}\n${err.stack}`);
      });
      this.isReply = true;
    } else {
      // 送信する
      await this.interaction.reply(message.export()).catch((err) => {
        throw new Error(`${err.message}\n${err.stack}`);
      });
      this.isReply = true;
    }
  };

  /** InteractionReplyMessage[]を利用して複数のメッセージを送信します */
  private sendMessagesToDiscord = async (): Promise<void> => {
    for (let i = 0; i < this.messages.length; i += 1) {
      const message = this.messages[i];
      if (message.delay) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(message.delay);
      }
      // eslint-disable-next-line no-await-in-loop
      await this.sendMessageToDiscord(message);
    }
  };

  /**
   * メッセージもしくはmodalをdiscordに送信します。
   * ※一度呼び出すと、再度呼び出すことはできません。
   * 通常、onInteractionで呼び出されるため、意図的に呼ぶ必要はありません。
   * @returns null
   * @throws MessageAlreadySentRuntimeError 2回目以降の呼び出し時
   */
  send = async (): Promise<void> => {
    if (this.isReply) {
      throw new MessageAlreadySentRuntimeError();
    }
    if (this.modal && !this.interaction.isModalSubmit()) {
      // memo: isModalSubmit避けのためにinteraction.isModalSubmitを呼ぶのは適切か？
      await this.interaction.showModal(this.modal);
    } else {
      if (this.messages.length === 0) {
        // コマンドを実行しました！というメッセージ追加する
        this.addMessage(MessagePayloadOptionWrapper.createBase(DiscordMessage.RunCommanded));
      }
      await this.sendMessagesToDiscord();
    }
  };
}

export default MessageAbleInteractionWrapper;
