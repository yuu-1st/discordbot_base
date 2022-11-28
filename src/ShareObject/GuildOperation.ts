import {
  ChannelType,
  Client,
  DiscordAPIError,
  Guild,
  MessageCreateOptions,
  Role,
} from 'discord.js';
import { UnexpectedElseLogicalError } from '../Error/LogicalError.js';
import {
  DiscordApiRuntimeError,
  FailedToFetchValueRuntimeError,
  UnexpectedTypeRuntimeError,
} from '../Error/RuntimeError.js';
import { UnknownError } from '../Error/UnknownError.js';
import Logger from '../Util/Logger.js';
import { NonNullablesFilter } from '../Util/TypeGuard.js';
import MessagePayloadOptionWrapper from '../Wrapper/message/MessagePayloadWrapper.js';
import MessageWrapper, { MessageWrapperBase } from '../Wrapper/message/MessageWrapper.js';
import { discordIds } from '../config/discordIds.js';
import { GuildMemberUserWrapper } from '../Wrapper/UserWrapper.js';

const fetchError = (e: Error): never => {
  if (e instanceof DiscordAPIError) {
    throw new DiscordApiRuntimeError(e);
  } else {
    throw new UnknownError(e);
  }
};

type sendMessageType = {
  (
    channelId: string,
    content: MessagePayloadOptionWrapper<MessageCreateOptions>,
  ): Promise<MessageWrapper>;
  (
    channelId: string,
    ...args: Parameters<typeof MessagePayloadOptionWrapper.createBase>
  ): Promise<MessageWrapper>;
};

/**
 * ギルドに関する操作を行うクラスです。
 */
class GuildOperation {
  readonly client: Client<true>;

  readonly mainGuild: Guild;

  /**
   * ギルドを取得する
   * @param client クライアント
   * @param guildId ギルドID
   * @returns ギルド
   */
  static getGuild = async (client: Client<true>, guildId: string) => {
    const guild = await client.guilds.fetch(guildId).catch(fetchError);
    return guild;
  };

  /**
   * インスタンスを生成する
   * @param client クライアント
   * @returns インスタンス
   */
  static create = async (client: Client<true>) => {
    const guild = await GuildOperation.getGuild(client, discordIds.MainServerId);
    return new GuildOperation(client, guild);
  };

  /**
   * constructor
   * @param client クライアント
   * @param mainGuild メインギルド
   */
  constructor(client: Client<true>, mainGuild: Guild) {
    this.client = client;
    this.mainGuild = mainGuild;
  }

  /**
   * ロールを取得する
   * @param roleId ロールIDまたはロール名
   * @param guild ギルド。省略時はメインギルド
   * @returns ロール。存在しない場合は与えられたroleId(string)
   */
  getRole = async (roleId: string | Role, guild: Guild = this.mainGuild) => {
    if (roleId instanceof Role) {
      return roleId;
    }
    // roleIdがsnowflakeかどうかをチェックする
    if (/^\d+$/.test(roleId)) {
      const role = await guild.roles.fetch(roleId).catch(fetchError);
      if (role === null) {
        return roleId;
      }
      return role;
    }
    // ロール名から検索する
    const role = guild.roles.cache.find((r) => r.name === roleId);
    if (role === undefined) {
      return roleId;
    }
    return role;
  };

  /**
   * ロールを取得する
   * @param roleIds ロールIDまたはロール名の配列
   * @param guild ギルド。省略時はメインギルド
   * @returns ロールの配列。存在しない場合は与えられたroleId(string)
   */
  getRoles = async (roleIds: string | Role | (string | Role)[], guild: Guild = this.mainGuild) => {
    if (roleIds instanceof Array) {
      const roles = await Promise.all(roleIds.map((roleId) => this.getRole(roleId, guild)));
      return roles;
    }
    const role = await this.getRole(roleIds, guild);
    return [role];
  };

  /**
   * メンバーを取得する
   * @param userId ユーザーID
   * @param guild ギルド。省略時はメインギルド
   * @returns メンバー。存在しない場合はnull
   */
  getMember = async (userId: string, guild: Guild = this.mainGuild) => {
    const member = await guild.members.fetch(userId).catch((e: Error) => {
      if (e instanceof DiscordAPIError) {
        Logger.debug('system', e.message, e.code, userId);
        if (e.message === 'Unknown User' && e.code === 10013) {
          return null;
        }
        if (e.message === 'Unknown Member' && e.code === 10007) {
          return null;
        }
        throw new DiscordApiRuntimeError(e);
      } else {
        throw new UnknownError(e);
      }
    });
    if (member === null) {
      return null;
    }
    return new GuildMemberUserWrapper(member);
  };

  /**
   * メッセージを取得する
   * @param channelId チャンネルID
   * @param messageId メッセージID
   * @returns メッセージ。存在しない場合はnull
   */
  getMessage = async (channelId: string, messageId: string) => {
    const channel = await this.client.channels.fetch(channelId).catch(fetchError);
    if (channel === null) {
      throw new FailedToFetchValueRuntimeError(`channelId: ${channelId}`);
    }
    if (!channel.isTextBased()) {
      throw new UnexpectedTypeRuntimeError(`channelId: ${channelId}, channelType: ${channel.type}`);
    }
    const message = await channel.messages.fetch(messageId).catch((e: Error) => {
      if (e instanceof DiscordAPIError) {
        if (e.message === 'Unknown Message' && e.code === 10008) {
          return null;
        }
        throw new DiscordApiRuntimeError(e);
      } else {
        throw new UnknownError(e);
      }
    });
    if (message === null) {
      return null;
    }
    const messageWrapper = MessageWrapperBase.create(message);
    return messageWrapper;
  };

  /**
   * チャンネルにメッセージを送信する
   * @param channelId チャンネルID
   * @param args メッセージ内容
   * @returns 送信したメッセージ
   */
  sendMessage: sendMessageType = async (channelId, ...args) => {
    const channel = await this.client.channels.fetch(channelId).catch(fetchError);
    if (channel === null) {
      throw new FailedToFetchValueRuntimeError(`channelId: ${channelId}`);
    }
    if (!channel.isTextBased()) {
      throw new UnexpectedTypeRuntimeError(`channelId: ${channelId}, channelType: ${channel.type}`);
    }

    const argsCheck = (
      key: unknown[],
    ): key is Parameters<typeof MessagePayloadOptionWrapper.createBase> => {
      if (key[0] instanceof MessagePayloadOptionWrapper) {
        return false;
      }
      return true;
    };

    if (argsCheck(args)) {
      const base = MessagePayloadOptionWrapper.createBase(...args);
      const message = await channel.send(base.export()).catch(fetchError);
      return MessageWrapperBase.create(message);
    }
    if (args[0] instanceof MessagePayloadOptionWrapper) {
      const message = await channel.send(args[0].export()).catch(fetchError);
      return MessageWrapperBase.create(message);
    }
    Logger.debug('system', args);
    throw new UnexpectedElseLogicalError();
  };

  /**
   * 全てのチャンネルを取得する
   * @param guild ギルド。省略時はメインギルド
   * @returns チャンネルの配列
   */
  getAllChannels = async (guild: Guild = this.mainGuild) => {
    const channels = await guild.channels.fetch().catch(fetchError);
    return NonNullablesFilter(channels);
  };

  /**
   * 特定の種類のチャンネルを全て取得する
   * @param type チャンネルの種類
   * @param guild ギルド。省略時はメインギルド
   * @returns チャンネルの配列
   */
  getTypeChannels = async (type: ChannelType, guild: Guild = this.mainGuild) => {
    const channels = await this.getAllChannels(guild);
    const filteredChannels = channels.filter((channel) => channel.type === type);
    return filteredChannels;
  };
}

export default GuildOperation;
