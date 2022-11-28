import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Logger from '../../../Util/Logger.js';
import { ChatInputInteractionCreateEventClass } from '../../../Util/MainClass/InteractionCreateEventClass.js';
import MessagePayloadOptionWrapper from '../../../Wrapper/message/MessagePayloadWrapper.js';
import nameList, { slashCommandTest } from '../NameList.js';

const event = new ChatInputInteractionCreateEventClass({
  interactionName: nameList.slashCommand,
  userDataRequired: false,
  loadingEnvironment: ['test'],
  main: async (_, userData, interaction) => {
    if (userData) {
      const p = MessagePayloadOptionWrapper.createBase('userData load.');
      p.addComponents([
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(nameList.button)
            .setLabel('select menu')
            .setStyle(ButtonStyle.Primary),
        ),
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(nameList.buttonModal)
            .setLabel('modal')
            .setStyle(ButtonStyle.Primary),
        ),
      ]);
      interaction.addMessage(p);
    } else {
      interaction.addMessage(MessagePayloadOptionWrapper.createBase('userData no load.'));
    }
  },
});

const event2 = new ChatInputInteractionCreateEventClass({
  userDataRequired: false,
  commandObject: slashCommandTest,
  loadingEnvironment: ['test'],
  main: async (_, userData, interaction, arg) => {
    if (userData) {
      interaction.addMessage(MessagePayloadOptionWrapper.createBase('userData load.'));
    } else {
      interaction.addMessage(MessagePayloadOptionWrapper.createBase('userData no load.'));
    }
    Logger.debug('default', arg);
  },
});

const event3 = new ChatInputInteractionCreateEventClass({
  userDataRequired: false,
  commandObject: slashCommandTest,
  loadingEnvironment: [],
  main: async (_, userData, interaction, arg) => {
    if (userData) {
      interaction.addMessage(MessagePayloadOptionWrapper.createBase('userData load.'));
    } else {
      interaction.addMessage(MessagePayloadOptionWrapper.createBase('userData no load.'));
    }
    Logger.debug('default', arg);
  },
});

export default [event, event2, event3, null];
