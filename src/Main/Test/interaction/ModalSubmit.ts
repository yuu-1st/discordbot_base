import { ModalSubmitInteractionCreateEventClass } from '../../../Util/MainClass/InteractionCreateEventClass.js';
import MessagePayloadOptionWrapper from '../../../Wrapper/message/MessagePayloadWrapper.js';
import nameList from '../NameList.js';

const event = new ModalSubmitInteractionCreateEventClass({
  interactionName: nameList.modalSubmit,
  userDataRequired: false,
  loadingEnvironment: ['test'],
  main: async (_, __, interaction) => {
    interaction.addMessage(
      MessagePayloadOptionWrapper.createBase(
        `modal data is '${interaction.getArgs(nameList.modalArgs)}'.`,
      ),
    );
  },
});

export default event;
