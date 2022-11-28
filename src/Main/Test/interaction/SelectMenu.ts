import { SelectMenuInteractionCreateEventClass } from '../../../Util/MainClass/InteractionCreateEventClass.js';
import MessagePayloadOptionWrapper from '../../../Wrapper/message/MessagePayloadWrapper.js';
import nameList from '../NameList.js';

const event = new SelectMenuInteractionCreateEventClass({
  interactionName: nameList.selectMenu,
  userDataRequired: false,
  loadingEnvironment: ['test'],
  main: async (_, __, interaction) => {
    interaction.addMessage(
      MessagePayloadOptionWrapper.createBase(
        `select value is '${interaction.getArgs().join(',')}'.`,
      ),
    );
  },
});

export default event;
