import { MessageCreateEventClass } from '../../../Util/MainClass/MessageCreateEventClass.js';
import MessagePayloadOptionWrapper from '../../../Wrapper/message/MessagePayloadWrapper.js';

const event = new MessageCreateEventClass({
  loadingEnvironment: ['test'],
  mentionOnly: 'User',
  guildOnly: false,
  userDataRequired: false,
  async main(shareObject, userData, message) {
    await message.sendReply(MessagePayloadOptionWrapper.createBase('mentioned!'));
  },
});

export default event;
