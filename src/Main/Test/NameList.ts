import { CommandObject } from '../../Util/MainClass/CommandObject.js';

const nameList = {
  slashCommand: 'test-slash-command',
  button: 'test-button',
  buttonModal: 'test-button-modal',
  selectMenu: 'test-select-menu',
  modalSubmit: 'test-modal-submit',
  modalArgs: 'modalArg',
};

export const slashCommandTest = {
  name: 'test-command',
  description: 'this is test',
  option: [
    {
      key: 'subCommand',
      name: 'sub-a',
      description: 'sub-A',
    },
    {
      key: 'subCommand',
      name: 'sub-b',
      description: 'sub-B',
      option: [
        {
          key: 'string',
          name: 'message',
          description: 'send some message.',
          require: false,
        },
      ],
    },
    {
      key: 'subCommand',
      name: 'sub-c',
      description: 'sub-C',
      option: [
        {
          key: 'user',
          name: 'mention',
          description: 'send some member.',
          require: true,
        },
      ],
    },
    {
      key: 'subCommand',
      name: 'sub-d',
      description: 'sub-D',
      option: [
        {
          key: 'string',
          name: 'test-a',
          description: 'test-a',
          require: false,
        },
        {
          key: 'integer',
          name: 'test-b',
          description: 'test-b',
          require: false,
        },
        {
          key: 'user',
          name: 'test-c',
          description: 'test-c',
          require: false,
        },
      ],
    },
  ],
} as const satisfies CommandObject;

export default nameList;
