import {
  Events,
  GatewayIntentBits,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  Partials,
  User,
} from 'discord.js';
import { UnexpectedElseLogicalError } from '../Error/index.js';
import { LoadDiscordUserData } from '../Load/LoadDiscordUserData.js';
import { MainFileLoad } from '../Load/MainFileLoad.js';
import { ShareObject } from '../ShareObject/ShareObject.js';
import Logger from '../Util/Logger.js';
import {
  MessageReactionAddEventClass,
  MessageReactionEventBaseClass,
  MessageReactionRemoveEventClass,
} from '../Util/MainClass/MessageReactionEventClass.js';
import MessageReactionWrapper from '../Wrapper/reaction/MessageReactionWrapper.js';
import { EnvironmentType, config } from '../config/config.js';
import { clientOnInterface } from './clientOn.js';
import { eventClassExecute } from './onBase.js';

const classList = {
  add: [] as MessageReactionAddEventClass<boolean>[],
  remove: [] as MessageReactionRemoveEventClass<boolean>[],
};

const onMessageReactionAdd = async (
  shareObject: ShareObject,
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
) => {
  const reactionWrapper = new MessageReactionWrapper(reaction, user);
  const userData = await LoadDiscordUserData(
    shareObject.guildOperation,
    reactionWrapper.getMessage().getGuildId(),
    reactionWrapper.reactionUserID,
  );
  Logger.outputToDebuglog('Event', () => [
    `onMessageReactionAdd.execute called. ID: ${reactionWrapper.originalSnowflakeId}`,
  ]);

  await eventClassExecute({
    eventClass: classList.add,
    classArgs: [shareObject, userData, reactionWrapper],
  });
};

const onMessageReactionRemove = async (
  shareObject: ShareObject,
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
) => {
  const reactionWrapper = new MessageReactionWrapper(reaction, user);
  const userData = await LoadDiscordUserData(
    shareObject.guildOperation,
    reactionWrapper.getMessage().getGuildId(),
    reactionWrapper.reactionUserID,
  );
  Logger.outputToDebuglog('Event', () => [
    `onMessageReactionRemove.execute called. ID: ${reactionWrapper.originalSnowflakeId}`,
  ]);

  await eventClassExecute({
    eventClass: classList.remove,
    classArgs: [shareObject, userData, reactionWrapper],
  });
};

const loadReactionMain = async (environment: EnvironmentType) => {
  const load = await MainFileLoad<MessageReactionEventBaseClass<boolean>>(
    environment,
    MessageReactionEventBaseClass.DirectoryName,
    MessageReactionEventBaseClass,
  );
  load.forEach((v) => {
    if (v instanceof MessageReactionAddEventClass) {
      classList.add.push(v);
    } else if (v instanceof MessageReactionRemoveEventClass) {
      classList.remove.push(v);
    } else {
      throw new UnexpectedElseLogicalError(v.constructor.name);
    }
  });
};

const onReaction: clientOnInterface = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  execute: async (shareObject) => {
    // Main/reactionディレクトリの読み込み
    await loadReactionMain(config.Environment);

    shareObject.client.on(Events.MessageReactionAdd, async (reaction, user) => {
      await onMessageReactionAdd(shareObject, reaction, user);
    });

    shareObject.client.on(Events.MessageReactionRemove, async (reaction, user) => {
      await onMessageReactionRemove(shareObject, reaction, user);
    });
  },
};

export default onReaction;
