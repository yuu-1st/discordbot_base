import Logger from '../../../Util/Logger.js';
import {
  MessageCreateEventClass,
  MessageDeleteEventClass,
  MessageUpdateEventClass,
} from '../../../Util/MainClass/MessageCreateEventClass.js';

const event = new MessageCreateEventClass({
  loadingEnvironment: ['test'],
  mentionOnly: 'All',
  guildOnly: true,
  userDataRequired: false,
  async main(shareObject, userData, message) {
    Logger.debug(
      'default',
      `Create => channelID: ${message.getChannelId()} / content: ${
        message.content
      } (${message.isPartial()})`,
      message.getAttachments().map((a) => `url: ${a.url}, proxyUrl: ${a.proxyURL}`),
    );
  },
});

const event2 = new MessageDeleteEventClass({
  loadingEnvironment: ['test'],
  mentionOnly: 'All',
  guildOnly: true,
  userDataRequired: false,
  async main(shareObject, userData, message) {
    Logger.debug(
      'default',
      `Delete => channelID: ${message.getChannelId()} / content: ${
        message.content
      } (${message.isPartial()})`,
    );
  },
});

const event3 = new MessageUpdateEventClass({
  loadingEnvironment: ['test'],
  mentionOnly: 'All',
  guildOnly: true,
  userDataRequired: false,
  async main(shareObject, userData, oldMessage, newMessage) {
    Logger.debug(
      'default',
      `Update => channelID: ${newMessage.getChannelId()} / before: ${
        oldMessage.content
      }  (${oldMessage.isPartial()}) / after: ${newMessage.content} (${newMessage.isPartial()})`,
    );
  },
});

export default [event, event2, event3];
