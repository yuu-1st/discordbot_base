/* eslint-disable max-classes-per-file */
import assert from 'assert';
import dayjs from 'dayjs';
import {
  Collection,
  DiscordAPIError,
  Guild,
  GuildTextBasedChannel,
  If,
  Message,
  MessageReplyOptions,
  PartialMessage,
  Role,
  Snowflake,
  TextBasedChannel,
} from 'discord.js';
import { UnexpectedElseLogicalError } from '../../Error/LogicalError.js';
import { UserWrapper } from '../UserWrapper.js';
import MessagePayloadOptionWrapper from './MessagePayloadWrapper.js';

type createType = {
  <G extends boolean>(message: Message<G>): MessageWrapper<G>;
  (message: PartialMessage): PartialMessageWrapper<boolean>;
  (message: Message | PartialMessage): MessageWrapper<boolean> | PartialMessageWrapper<boolean>;
};

type sendReplyType = {
  /**
   * メッセージを返信します。
   * @param message 返信するメッセージのオブジェクト
   * @returns 返信したメッセージのラッパー
   */
  (message: MessagePayloadOptionWrapper<MessageReplyOptions>): Promise<MessageWrapper>;
  /**
   * メッセージを返信します。
   * @param args 返信するメッセージのオプション
   * @returns 返信したメッセージのラッパー
   */
  (...args: Parameters<typeof MessagePayloadOptionWrapper.createBase>): Promise<MessageWrapper>;
};

/**
 * Messageクラスのラッパークラスの基底クラスです。
 */
export class MessageWrapperBase<InGuild extends boolean, Partial extends boolean> {
  readonly inGuild: InGuild;

  readonly partial: Partial;

  /** discordjsのMessageクラス本体 */
  readonly messageClass: If<Partial, PartialMessage, Message<InGuild>>;

  /** @returns メッセージ本文 */
  get content(): If<Partial, string | null, string> {
    assert(this.partial || this.messageClass.content !== null);
    return this.messageClass.content as If<Partial, string | null, string>;
  }

  /**
   * constructor
   * @param message messageクラス
   * @param inGuild ギルド内に投稿されたメッセージかどうか
   * @param partial PartialMessageかどうか
   */
  protected constructor(
    message: If<Partial, PartialMessage, Message<InGuild>>,
    inGuild: InGuild,
    partial: Partial,
  ) {
    assert(partial === message.partial, 'partialが正しく設定されていません');
    this.partial = partial;
    this.messageClass = message;
    this.inGuild = inGuild;
  }

  static create: createType = (message: Message | PartialMessage) => {
    if (message.partial) {
      if (message.inGuild()) {
        // 型推論がうまくいかないので、anyでキャストする
        return new MessageWrapperBase(message, true, true) as any;
      }
      return new MessageWrapperBase(message, false, true);
    }
    if (message.inGuild()) {
      return new MessageWrapperBase(message, true, false);
    }
    return new MessageWrapperBase(message, false, false);
  };

  /** @returns guild内に投稿されたメッセージかどうか */
  isInGuild = (): this is MessageWrapperBase<true, Partial> => this.inGuild;

  /** @returns PartialMessageかどうか */
  isPartial = (): this is PartialMessageWrapper<InGuild> => this.partial;

  /** @returns PartialではないMessageかどうか */
  // partialの逆はtotalやrequireなどになりそうなのだが、自動補完などでややこしくなるのでNotをつけている。
  isNotPartial = (): this is MessageWrapper => !this.partial;

  /**
   * messageID(snowflake)を返します。
   * @returns messageID
   */
  getMessageId = (): Snowflake => this.messageClass.id;

  /**
   * 添付ファイル情報を返します。
   * @returns 添付ファイル情報
   */
  getAttachments = () => this.messageClass.attachments;

  /**
   * 添付ファイルの個数を返します。
   * @returns 添付ファイルの個数
   */
  getAttachmentSize = () => this.getAttachments().size;

  /**
   * メッセージ作成者を返します。
   * @returns userクラス
   */
  getAuthor = (): If<Partial, UserWrapper | null, UserWrapper> => {
    assert(this.partial || this.messageClass.author !== null);
    if (this.messageClass.author === null) {
      return null as If<Partial, UserWrapper | null, UserWrapper>;
    }
    return new UserWrapper(this.messageClass.author) as If<
      Partial,
      UserWrapper | null,
      UserWrapper
    >;
  };

  /**
   * message作成者者のdiscordIdを取得します
   * @returns discordId
   */
  getAuthorDiscordId = (): If<Partial, string | null, string> => {
    const author = this.getAuthor();
    assert(this.partial || author !== null);
    return (author?.discordId ?? null) as If<Partial, string | null, string>;
  };

  /**
   * message作成者者の表示名を取得します
   * @returns 表示名
   */
  getAuthorDiscordName = (): If<Partial, string | null, string> => {
    const author = this.getAuthor();
    assert(this.partial || author !== null);
    return (author?.displayName ?? null) as If<Partial, string | null, string>;
  };

  /**
   * メッセージの投稿時間を取得します。
   * @returns 投稿時間
   */
  getCreatedAt = (): dayjs.Dayjs => dayjs(this.messageClass.createdAt);

  /**
   * messageが送信されたギルドサーバーを取得します
   * @returns roles
   */
  getGuild = (): If<InGuild, Guild> => {
    // MEMO: PartialMessageにInGuild関連のプロパティが上手く設定されないので手動
    assert(this.inGuild || this.messageClass.guildId === null);
    assert(!this.inGuild || this.messageClass.guildId !== null);
    return this.messageClass.guild as If<InGuild, Guild>;
  };

  /**
   * messageが送信されたギルドサーバーIDを取得します
   * @returns roles
   */
  getGuildId = (): If<InGuild, Snowflake> => {
    assert(this.inGuild || this.messageClass.guildId === null);
    assert(!this.inGuild || this.messageClass.guildId !== null);
    return this.messageClass.guildId as If<InGuild, Snowflake>;
  };

  /**
   * messageが送信されたチャンネルを取得します
   * @returns roles
   */
  getChannel = (): If<InGuild, GuildTextBasedChannel, TextBasedChannel> => {
    assert(this.inGuild || this.messageClass.channel === null);
    assert(!this.inGuild || this.messageClass.channel !== null);
    return this.messageClass.channel as If<InGuild, GuildTextBasedChannel, TextBasedChannel>;
  };

  /**
   * messageが送信されたチャンネルIDを取得します
   * @returns roles
   */
  getChannelId = () => this.messageClass.channelId;

  /**
   * ユーザーがメンションされているかを取得します
   * @param discordId 対象とするユーザーのdiscordId
   * @returns メンションされているかどうか
   */
  isMentioned = (discordId: string) => this.messageClass.mentions.users.has(discordId);

  /**
   * Roleがメンションされているかを取得します
   * @param roles ロールidか、Roleインスタンス。もしくはそれらの配列
   * @returns メンションされているかどうか
   */
  isRoleMentioned = (roles: string | Role | string[] | Collection<string, Role>): boolean => {
    if (roles instanceof Collection) {
      const bool = roles.map((role) => this.messageClass.mentions.roles.has(role.id));
      if (bool.findIndex((v) => v) !== -1) {
        return true;
      }
      return false;
    }
    if (roles instanceof Array) {
      const bool = roles.map((role) => this.messageClass.mentions.roles.has(role));
      if (bool.findIndex((v) => v) !== -1) {
        return true;
      }
      return false;
    }
    if (roles instanceof Role) {
      return this.messageClass.mentions.roles.has(roles.id);
    }
    return this.messageClass.mentions.roles.has(roles);
  };

  /**
   * メッセージを返信します。
   * @param args 返信するメッセージ
   * @returns 返信したメッセージのラッパー
   */
  sendReply: sendReplyType = async (...args): Promise<MessageWrapper> => {
    const argsCheck = (
      key: unknown[],
    ): key is Parameters<typeof MessagePayloadOptionWrapper.createBase> => {
      if (key[0] instanceof MessagePayloadOptionWrapper) {
        return false;
      }
      return true;
    };
    // 引数の1つ目がMessagePayloadOptionWrapperのインスタンスかどうか
    if (args[0] instanceof MessagePayloadOptionWrapper) {
      const sendedMessage = await this.messageClass.reply(args[0].export());
      return MessageWrapperBase.create(sendedMessage);
    }
    if (argsCheck(args)) {
      const message = MessagePayloadOptionWrapper.createBase(...args);
      const sendedMessage = await this.messageClass.reply(message.export());
      return MessageWrapperBase.create(sendedMessage);
    }
    throw new UnexpectedElseLogicalError();
  };

  /**
   * メッセージに付けられたリアクションを取得します。
   * @param id リアクションのid
   * @returns リアクション
   */
  getReactions = (id: string) => this.messageClass.reactions.cache.get(id);

  /**
   * メッセージにリアクションを付与します。
   * @param reactionId 付与するリアクションのid
   */
  addReaction = async (reactionId: string | string[]) => {
    if (reactionId instanceof Array) {
      await Promise.all(reactionId.map((id) => this.messageClass.react(id)));
    } else {
      await this.messageClass.react(reactionId);
    }
  };

  /**
   * メッセージにある全てのリアクションを削除します。
   */
  removeAllReactions = async () => {
    await this.messageClass.reactions.removeAll();
  };

  /**
   * メッセージの編集時間を取得します。
   * @returns 最終編集時間
   */
  getEditedTimestamp = () => this.messageClass.editedTimestamp;

  /**
   * メッセージを削除します。
   */
  delete = async () => {
    try {
      await this.messageClass.delete();
    } catch (e) {
      if (e instanceof DiscordAPIError) {
        if (e.code === 10008) {
          return;
        }
      }
      throw e;
    }
  };
}

/**
 * MessageWrapperBaseクラスと異なる型を持つメソッドを定義します。
 */
interface MessageWrapperExtends {
  /** @returns guild内に投稿されたメッセージかどうか */
  isInGuild: () => this is MessageWrapper<true>;
}

/**
 * Messageクラスのラッパークラスです。
 *
 * 注意：本体はMessageWrapperBaseクラスで、このクラスは型定義のみです。
 */
export type MessageWrapper<InGuild extends boolean = boolean> = Omit<
  MessageWrapperBase<InGuild, false>,
  keyof MessageWrapperExtends
> &
  MessageWrapperExtends;

/**
 * MessageWrapperBaseクラスと異なる型を持つメソッドを定義します。
 */
interface PartialMessageWrapperExtends {
  /** @returns guild内に投稿されたメッセージかどうか */
  isInGuild: () => this is PartialMessageWrapper<true>;
}

/**
 * PartialMessageクラスのラッパークラスです。
 *
 * 注意：本体はMessageWrapperBaseクラスで、このクラスは型定義のみです。
 */
export type PartialMessageWrapper<InGuild extends boolean = boolean> = Omit<
  MessageWrapperBase<InGuild, true>,
  keyof PartialMessageWrapperExtends
> &
  PartialMessageWrapperExtends;

export default MessageWrapper;
