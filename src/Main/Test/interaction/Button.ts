import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { ButtonInteractionCreateEventClass } from '../../../Util/MainClass/InteractionCreateEventClass.js';
import MessagePayloadOptionWrapper from '../../../Wrapper/message/MessagePayloadWrapper.js';
import nameList from '../NameList.js';

const event = new ButtonInteractionCreateEventClass({
  interactionName: nameList.button,
  userDataRequired: false,
  loadingEnvironment: ['test'],
  main: async (_, __, interaction) => {
    const p = MessagePayloadOptionWrapper.createBase('show select menu.');
    p.addComponents([
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(nameList.selectMenu)
          .setPlaceholder('Nothing selected')
          .addOptions(
            {
              label: 'Select me',
              description: 'This is a description',
              value: 'first_option',
            },
            {
              label: 'You can select me too',
              description: 'This is also a description',
              value: 'second_option',
            },
          ),
      ),
    ]);
    interaction.addMessage(p);
  },
});

export default event;
