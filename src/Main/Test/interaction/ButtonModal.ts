import {
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { ButtonInteractionCreateEventClass } from '../../../Util/MainClass/InteractionCreateEventClass.js';
import nameList from '../NameList.js';

const event = new ButtonInteractionCreateEventClass({
  interactionName: nameList.buttonModal,
  userDataRequired: false,
  loadingEnvironment: ['test'],
  main: async (_, __, interaction) => {
    const modal = new ModalBuilder().setCustomId(nameList.modalSubmit).setTitle('Test Modal');

    const dataInput = new TextInputBuilder()
      .setCustomId(nameList.modalArgs)
      .setLabel('Input some words.')
      .setStyle(TextInputStyle.Short);

    const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
      dataInput,
    );

    modal.addComponents(firstActionRow);

    interaction.addModal(modal);
  },
});

export default event;
