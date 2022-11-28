import { Client, Events } from 'discord.js';
import Logger from '../Util/Logger.js';
import { config } from '../config/config.js';
import { discordIds } from '../config/discordIds.js';
import ActiveCodeCount from './ActiveCodeCount.js';
import GuildOperation from './GuildOperation.js';
import SelfOperation from './SelfOperation.js';
import { ImpartialShareObject } from './ShareObject.js';
import { DiscordMessage } from '../Util/ConsoleMessages.js';
import { clientOnInterface } from '../Event/clientOn.js';
import onCron from '../Event/cron.js';
import onReaction from '../Event/onReaction.js';
import onVoice from '../Event/onVoice.js';
import onMessage from '../Event/onMessages.js';
import onInteraction from '../Event/onInteraction.js';

const eventList: clientOnInterface[] = [onCron, onInteraction, onMessage, onReaction, onVoice];

/**
 * discordに接続します。
 * @param impartialShareObject 最低限必要な共有オブジェクト
 */
const ConnectDiscord = async (
  impartialShareObject: ImpartialShareObject<
    'client' | 'selfOperation' | 'activeCodeCount' | 'guildOperation'
  >,
) => {
  // clientオブジェクトを作成
  const client = new Client({
    intents: [...new Set(eventList.flatMap((v) => v.intents))],
    partials: [...new Set(eventList.flatMap((v) => v.partials))],
  });

  // ログイン完了時のイベントを登録
  client.once(Events.ClientReady, async (clientTrue) => {
    Logger.info('system', 'discord bot login.');
    const selfOperation = new SelfOperation(clientTrue);
    const guildOperation = await GuildOperation.create(clientTrue);
    const shareObject = {
      guildOperation,
      client,
      selfOperation,
      activeCodeCount: new ActiveCodeCount(),
      ...impartialShareObject,
    };

    // 各種イベントを登録
    await Promise.all(eventList.map(async (v) => v.execute(shareObject)));

    Logger.info('system', 'discord bot ready.');
    // 起動完了を通知
    await guildOperation.sendMessage(discordIds.LogChannelId, DiscordMessage.Ready);
  });

  // ログインを試みる。
  await client.login(config.DiscordBotToken);
};

export default ConnectDiscord;
