import { discordIds } from '../../../config/discordIds.js';
import { CommandObject } from '../../../Util/MainClass/CommandObject.js';
import { ChatInputInteractionCreateEventClass } from '../../../Util/MainClass/InteractionCreateEventClass.js';
import SetCommand from '../../../Util/MainClass/SetCommand.js';
import MessagePayloadOptionWrapper from '../../../Wrapper/message/MessagePayloadWrapper.js';

const command = {
  name: 'shutdown',
  description: 'try discord bot shutdown.',
} as const satisfies CommandObject;

const setCommand = SetCommand.createCommand(command, ['test']);

const event = new ChatInputInteractionCreateEventClass({
  commandObject: command,
  userDataRequired: false,
  loadingEnvironment: ['test'],
  main: async (shareObject, _, interaction) => {
    if (interaction.getDiscordId() === discordIds.OwnerDiscordId) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      shareObject.activeCodeCount.shutdown(shareObject);
      interaction.addMessage(MessagePayloadOptionWrapper.createBase('シャットダウンを実行します'));
    } else {
      interaction.addMessage(
        MessagePayloadOptionWrapper.createBase('bot管理人以外はこのコマンドを実行できません。'),
      );
    }
  },
});

export default [setCommand, event];
