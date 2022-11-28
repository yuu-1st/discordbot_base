import { Events, GatewayIntentBits, Message, PartialMessage, Partials } from 'discord.js';
import { config, EnvironmentType } from '../config/config.js';
import { UnexpectedElseLogicalError } from '../Error/index.js';
import { LoadDiscordUserData } from '../Load/LoadDiscordUserData.js';
import { MainFileLoad } from '../Load/MainFileLoad.js';
import { ShareObject } from '../ShareObject/ShareObject.js';
import Logger from '../Util/Logger.js';
import {
  MessageCreateEventClass,
  MessageDeleteEventClass,
  MessageEventClass,
  MessageUpdateEventClass,
} from '../Util/MainClass/MessageCreateEventClass.js';
import { MessageWrapperBase } from '../Wrapper/message/MessageWrapper.js';
import { clientOnInterface } from './clientOn.js';
import { eventClassExecute } from './onBase.js';

const classList = {
  create: [] as MessageCreateEventClass<boolean, boolean>[],
  delete: [] as MessageDeleteEventClass<boolean, boolean>[],
  update: [] as MessageUpdateEventClass<boolean, boolean>[],
};

const onMessageCreate = async (shareObject: ShareObject, message: Message<boolean>) => {
  const messageWrapper = MessageWrapperBase.create(message);
  const userData = await LoadDiscordUserData(
    shareObject.guildOperation,
    messageWrapper.getGuildId(),
    messageWrapper.getAuthor().discordId,
  );
  Logger.outputToDebuglog('Event', () => [
    `OnMessageCreate.execute called. ID: ${messageWrapper.getMessageId()}`,
  ]);

  await eventClassExecute({
    eventClass: classList.create,
    classArgs: [shareObject, userData, messageWrapper],
  });
};

const onMessageDelete = async (
  shareObject: ShareObject,
  message: Message<boolean> | PartialMessage,
) => {
  const messageWrapper = MessageWrapperBase.create(message);
  const userData = await (() => {
    const user = messageWrapper.getAuthor();
    if (user) {
      return LoadDiscordUserData(
        shareObject.guildOperation,
        messageWrapper.getGuildId(),
        user.discordId,
      );
    }
    return null;
  })();
  Logger.outputToDebuglog('Event', () => [
    `OnMessageDelete.execute called. ID: ${messageWrapper.getMessageId()}`,
  ]);

  await eventClassExecute({
    eventClass: classList.delete,
    classArgs: [shareObject, userData, messageWrapper],
  });
};

const onMessageUpdate = async (
  shareObject: ShareObject,
  oldMessage: Message<boolean> | PartialMessage,
  newMessage: Message<boolean> | PartialMessage,
) => {
  const oldMessageWrapper = MessageWrapperBase.create(oldMessage);
  const newMessageWrapper = MessageWrapperBase.create(newMessage);
  const userData = await (() => {
    const user = newMessageWrapper.getAuthor();
    if (user) {
      return LoadDiscordUserData(
        shareObject.guildOperation,
        newMessageWrapper.getGuildId(),
        user.discordId,
      );
    }
    return null;
  })();
  Logger.outputToDebuglog('Event', () => [
    `OnMessageUpdate.execute called. ID: ${newMessageWrapper.getMessageId()}`,
  ]);
  await eventClassExecute({
    eventClass: classList.update,
    classArgs: [shareObject, userData, oldMessageWrapper, newMessageWrapper],
  });
};

const loadMessageMain = async (environment: EnvironmentType) => {
  const load = await MainFileLoad<MessageEventClass<boolean, boolean>>(
    environment,
    MessageEventClass.DirectoryName,
    MessageEventClass,
  );
  load.forEach((v) => {
    if (v instanceof MessageCreateEventClass) {
      classList.create.push(v);
    } else if (v instanceof MessageDeleteEventClass) {
      classList.delete.push(v);
    } else if (v instanceof MessageUpdateEventClass) {
      classList.update.push(v);
    } else {
      throw new UnexpectedElseLogicalError(v.constructor.name);
    }
  });
  return {
    onMessageCreate,
    onMessageDelete,
    onMessageUpdate,
  };
};

const onMessage: clientOnInterface = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
  execute: async (shareObject) => {
    // Main/messageディレクトリの読み込み
    await loadMessageMain(config.Environment);

    // イベントの登録
    shareObject.client.on(Events.MessageCreate, async (message) => {
      await shareObject.activeCodeCount.activate(onMessageCreate, shareObject, message);
    });

    shareObject.client.on(Events.MessageDelete, async (message) => {
      await shareObject.activeCodeCount.activate(onMessageDelete, shareObject, message);
    });

    shareObject.client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
      await shareObject.activeCodeCount.activate(
        onMessageUpdate,
        shareObject,
        oldMessage,
        newMessage,
      );
    });
  },
};

export default onMessage;
