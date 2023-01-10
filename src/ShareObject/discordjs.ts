import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { ImpartialShareObject } from './ShareObject.js';

/**
 * discordに接続します。
 */
const ConnectDiscord = async (impartialShareObject: ImpartialShareObject<'client'>) => {
  const shareObject = impartialShareObject;
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    rest: {
      timeout: 50, // デフォルト値
    },
  });

  shareObject.client = client;

  client.on('ready', () => {});

  await client.login(process.env.BOT_TOKEN);
};

export default ConnectDiscord;
