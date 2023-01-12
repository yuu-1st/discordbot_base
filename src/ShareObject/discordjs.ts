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
  });

  shareObject.client = client;

  client.on('ready', () => {});

  await client.login(shareObject.config.DiscordBotToken);
};

export default ConnectDiscord;
