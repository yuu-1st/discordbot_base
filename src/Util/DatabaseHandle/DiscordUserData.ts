import GuildOperation from '../../ShareObject/GuildOperation.js';

/**
 * データベースで管理するユーザーデータクラス。
 */
class DiscordUserData {
  protected readonly discordId: string;

  protected readonly guildOperation: GuildOperation;

  /**
   * discordIdから当クラスを生成します
   * @param guildOperation ギルド操作オブジェクト
   * @param discordId discordId
   * @returns DiscordUserData、失敗した場合はnull
   */
  static InstanceFromDiscordId = async (
    guildOperation: GuildOperation,
    discordId: string,
  ): Promise<DiscordUserData | null> => {
    const userData = new DiscordUserData(guildOperation, discordId);
    return userData;
  };

  private constructor(guildOperation: GuildOperation, discordId: string) {
    this.discordId = discordId;
    this.guildOperation = guildOperation;
  }
  // TODO: 各々実装
}

export default DiscordUserData;
