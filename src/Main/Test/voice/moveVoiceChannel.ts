import Logger from '../../../Util/Logger.js';
import { VoiceStateEventClass } from '../../../Util/MainClass/VoiceStateEventClass.js';

const event = new VoiceStateEventClass({
  loadingEnvironment: ['test'],
  userDataRequired: false,
  async main(shareObject, userData, voiceStates) {
    Logger.debug('default', `${voiceStates.userId} called :`);
    const join = voiceStates.isVoiceChannelJoined();
    const change = voiceStates.isVoiceChannelChange();
    const leave = voiceStates.isVoiceChannelLeft();
    if (join) {
      Logger.debug('default', `${voiceStates.userId} joined ${join}`);
    }
    if (change) {
      Logger.debug(
        'default',
        `${voiceStates.userId} changed from ${change.beforeChannelId} to ${change.afterChannelId}`,
      );
    }
    if (leave) {
      Logger.debug('default', `${voiceStates.userId} left ${leave}`);
    }
  },
});

export default event;
