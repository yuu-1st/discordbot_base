import SetCommand from '../../../Util/MainClass/SetCommand.js';
import nameList, { slashCommandTest } from '../NameList.js';

const test = SetCommand.createCommand(nameList.slashCommand, 'テストコマンド', ['test']);

const test2 = SetCommand.createCommand(slashCommandTest, ['test']);

export default [test, test2];
