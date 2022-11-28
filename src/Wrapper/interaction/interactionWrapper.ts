import {
  CacheType,
  GuildMemberRoleManager,
  Interaction,
  Snowflake,
  TextBasedChannel,
} from 'discord.js';
import { FailedToFetchValueRuntimeError, UnexpectedElseLogicalError } from '../../Error/index.js';

/**
 * Interactionのラッパークラスです。
 */
export class InteractionWrapper {
  static readonly fname: 'InteractionWrapper' = 'InteractionWrapper';

  protected interaction: Interaction<CacheType>;

  /**
   * コンストラクタ
   * @param interaction Interaction
   */
  constructor(interaction: Interaction<CacheType>) {
    this.interaction = interaction;
  }

  /**
   * interactionのID(snowflake)を取得します
   * @returns interaction名
   * @throws Error interaction名が取得できない場合
   */
  getInteractionId = (): Snowflake => this.interaction.id;

  /**
   * interaction名を取得します
   * @returns interaction名
   * @throws Error interaction名が取得できない場合
   */
  getInteractionName = (): string => {
    if ('commandName' in this.interaction) {
      return this.interaction.commandName;
    }
    if ('customId' in this.interaction) {
      return this.interaction.customId;
    }
    const i: never = this.interaction;
    throw new UnexpectedElseLogicalError(i);
  };

  /**
   * interaction実行者のguildIdを取得します
   * @returns guildId
   * @throws Error guildIdが取得できない場合
   */
  getGuildId = (): Snowflake => {
    const id = this.interaction.guildId;
    if (id) {
      return id;
    }
    throw new FailedToFetchValueRuntimeError('discordGuildId');
  };

  /**
   * interaction実行者のdiscordIdを取得します
   * @returns discordId
   */
  getDiscordId = (): string => this.interaction.user.id;

  /**
   * interaction実行者の表示名を取得します
   * @returns discordName
   */
  getDiscordName = (): string => this.interaction.user.displayName;

  /**
   * interaction実行者のrolesを取得します
   * @returns roles
   * @throws FailedToFetchValueRuntimeError rolesが取得できない場合
   */
  getRoles = (): GuildMemberRoleManager => {
    const roles = this.interaction.member?.roles;
    if (!roles || Array.isArray(roles)) {
      throw new FailedToFetchValueRuntimeError('discordRoles');
    }
    return roles;
  };

  /**
   * interaction実行時のチャンネルを取得します
   * @returns TextBasedChannel
   * @throws FailedToFetchValueRuntimeError channelが取得できない場合
   */
  getExecuteChannel = (): TextBasedChannel => {
    const { channel } = this.interaction;
    if (!channel) {
      throw new FailedToFetchValueRuntimeError('discordChannel');
    }
    return channel;
  };
}

export default InteractionWrapper;
