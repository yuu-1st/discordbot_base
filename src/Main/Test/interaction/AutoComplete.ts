import {
  AutoCompleteInteractionCreateEventClass,
  ChatInputInteractionCreateEventClass,
} from '../../../Util/MainClass/InteractionCreateEventClass.js';
import SetCommand from '../../../Util/MainClass/SetCommand.js';

const loadingEnvironment = ['test'] as ('test' | 'env')[];

const event = new AutoCompleteInteractionCreateEventClass({
  interactionName: 'test-auto-complete',
  userDataRequired: false,
  loadingEnvironment,
  main: async (_, __, interaction) => {
    const array = [
      'apple',
      'banana',
      'orange',
      'grape',
      'melon',
      'peach',
      'lemon',
      'strawberry',
      'cherry',
      'mango',
      'kiwi',
      'pineapple',
      'pear',
      'watermelon',
    ];
    const option = array.flatMap((v) => {
      if (v.startsWith(interaction.getFocusedOptionValue())) {
        return {
          name: v,
          value: v,
        };
      }
      return [];
    });

    await interaction.sendOptions(option);
  },
});

const chatInput = new ChatInputInteractionCreateEventClass({
  interactionName: 'test-auto-complete',
  userDataRequired: false,
  loadingEnvironment,
  main: async (_, __, interaction) => {
    console.log(interaction.getArgs.StringRequired('test'));
    console.log(interaction.getArgs.StringRequired('test2'));
    console.log(interaction.getArgs.StringRequired('test3'));
  },
});

const slashCommand = SetCommand.createCommand(
  'test-auto-complete',
  'オートコンプリート用のテストコマンド',
  loadingEnvironment,
);
slashCommand.addStringOption({
  name: 'test',
  description: 'テスト',
  require: true,
  autoComplete: true,
});

slashCommand.addStringOption({
  name: 'test2',
  description: 'テスト2',
  require: true,
  autoComplete: true,
});

slashCommand.addStringOption({
  name: 'test3',
  description: 'テスト3',
  require: true,
});

export default [event, slashCommand, chatInput];
