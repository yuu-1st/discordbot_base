import { FailedToFetchValueRuntimeError } from '../Error/index.js';
import GuildOperation from '../ShareObject/GuildOperation.js';
import DiscordUserData from '../Util/DatabaseHandle/DiscordUserData.js';

/**
 * ユーザーデータを読み込みます。
 * @param guildOperation ギルド操作オブジェクト
 * @param guildId サーバーID
 * @param discordId discordId
 * @returns インスタンス化されたDiscordUserDataかnull
 */
export const LoadDiscordUserData = async (
  guildOperation: GuildOperation,
  guildId: string | null,
  discordId: string,
): Promise<DiscordUserData | null> => {
  const userData = DiscordUserData.InstanceFromDiscordId(guildOperation, discordId);
  return userData;
};

/**
 * ユーザーデータを読み込みます。失敗した場合はエラーを返します。
 * @param guildOperation ギルド操作オブジェクト
 * @param guildId サーバーID
 * @param discordId discordId
 * @returns インスタンス化されたDiscordUserData
 * @throws FailedToFetchValueRuntimeError 読み込みに失敗した場合
 */
export const RequireLoadDiscordUserData = async (
  guildOperation: GuildOperation,
  guildId: string | null,
  discordId: string,
): Promise<DiscordUserData> => {
  const userData = await LoadDiscordUserData(guildOperation, guildId, discordId);
  if (userData) {
    return userData;
  }
  throw new FailedToFetchValueRuntimeError(`discord id: ${discordId}`);
};
