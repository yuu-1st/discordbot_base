import { Client, ClientUser, DiscordAPIError } from 'discord.js';
import { DiscordApiRuntimeError } from '../Error/RuntimeError.js';
import { UnknownError } from '../Error/UnknownError.js';
import { GuildMemberUserWrapper, UserWrapper } from '../Wrapper/UserWrapper.js';

/**
 * bot自身の情報や、bot自身の操作を行うクラスです。
 */
class SelfOperation {
  readonly client: Client<true>;

  /**
   * bot自身の情報
   */
  readonly user: ClientUser;

  /**
   * constructor
   * @param client discord.jsのClientクラス
   */
  constructor(client: Client<true>) {
    this.client = client;
    this.user = client.user;
  }

  /** @returns bot自身のdiscord userId */
  get userId() {
    return this.user.id;
  }

  /**
   * 自身の所属するサーバーの情報を取得します。
   * @param guildId サーバーID
   * @returns サーバー情報
   * @throws DiscordApiRuntimeError
   */
  getGuildOwn = async (guildId: string) => {
    const guild = await this.client.guilds.fetch(guildId).catch((e): never => {
      if (e instanceof DiscordAPIError) {
        throw new DiscordApiRuntimeError(e);
      } else {
        throw new UnknownError(e);
      }
    });
    const user = await guild.members.fetch(this.user.id);
    return new GuildMemberUserWrapper(user);
  };

  /**
   * 自身の所属するサーバーのロール情報を取得します。
   * @param guildId 取得するサーバーID
   * @returns ロール情報
   */
  getGuildRole = async (guildId: string) => {
    const guild = await this.getGuildOwn(guildId);
    return guild.roles;
  };

  /**
   * ユーザーIDを指定して、ユーザー情報を取得します。
   * @param userId ユーザーID
   * @returns ユーザー情報
   */
  getAnyUser = async (userId: string) => {
    const user = await this.client.users.fetch(userId).catch((e): never => {
      if (e instanceof DiscordAPIError) {
        throw new DiscordApiRuntimeError(e);
      } else {
        throw new UnknownError(e);
      }
    });
    return new UserWrapper(user);
  };
}

export default SelfOperation;
