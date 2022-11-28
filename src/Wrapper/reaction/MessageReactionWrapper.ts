import {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  Snowflake,
  SnowflakeUtil,
  User,
} from 'discord.js';
import { MessageWrapperBase } from '../message/MessageWrapper.js';
import { PartialUserWrapper, UserWrapper } from '../UserWrapper.js';

/**
 * MessageReactionクラスのラッパークラスです。
 */
class MessageReactionWrapper {
  private snowflake: Snowflake;

  private messageReactionObject: MessageReaction | PartialMessageReaction;

  private readonly reactionsUser: UserWrapper | PartialUserWrapper;

  /**
   * @returns このWrapperの元となったMessageReactionクラス
   */
  get messageReaction() {
    return this.messageReactionObject;
  }

  /**
   * constructor
   * @param messageReaction discord.jsのMessageReactionクラス
   * @param reactionUser discord.jsのUserクラス
   */
  constructor(
    messageReaction: MessageReaction | PartialMessageReaction,
    reactionUser: User | PartialUser,
  ) {
    this.messageReactionObject = messageReaction;
    this.snowflake = String(SnowflakeUtil.generate());
    this.reactionsUser = UserWrapper.create(reactionUser);
  }

  /** @returns snowflakeID。実際のイベントではIDが発行されないため、当クラスが勝手に生成した値。 */
  get originalSnowflakeId() {
    return this.snowflake;
  }

  /** @returns このリアクションの絵文字 */
  get emoji() {
    return this.messageReaction.emoji;
  }

  /** @returns このリアクションをしたユーザー */
  get reactionUser() {
    return this.reactionsUser;
  }

  /** @returns このリアクションをしたユーザーのId */
  get reactionUserID() {
    return this.reactionUser.discordId;
  }

  /** @returns リアクションを追加もしくは削除したメンバーがbot自身かどうか */
  isSelfEvent = () => this.messageReaction.me;

  /** @returns リアクション元のメッセージを取得します */
  getMessage = () => MessageWrapperBase.create(this.messageReaction.message);

  /** @returns このリアクションについている個数(人数) */
  getReactionCount = () => this.messageReaction.count;

  /** @returns このリアクションについている個数(人数)。Partialの場合は取得してから返します。 */
  getRequireReactionCount = async (): Promise<number> => {
    if (this.messageReaction.partial) {
      const r = await this.messageReaction.fetch();
      this.messageReactionObject = r;
      return r.count;
    }
    return this.messageReaction.count;
  };

  /** @returns このリアクションをしたユーザー一覧を取得します */
  getReactionUsers = () => this.messageReaction.users;
}

export default MessageReactionWrapper;
