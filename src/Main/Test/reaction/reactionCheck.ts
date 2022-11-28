import Logger from '../../../Util/Logger.js';
import { MessageReactionAddEventClass, MessageReactionRemoveEventClass } from '../../../Util/MainClass/MessageReactionEventClass.js';

const event = new MessageReactionAddEventClass({
  loadingEnvironment: ['test'],
  userDataRequired: false,
  async main(shareObject, userData, reaction) {
    Logger.debug('default', `${reaction.reactionUserID} reaction added : ${reaction.emoji}`);
  },
});

const event2 = new MessageReactionRemoveEventClass({
  loadingEnvironment: ['test'],
  userDataRequired: false,
  async main(shareObject, userData, reaction) {
    Logger.debug('default', `${reaction.reactionUserID} reaction removed : ${reaction.emoji}`);
  },
});

export default [event, event2];
