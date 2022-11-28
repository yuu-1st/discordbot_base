import { Events, GatewayIntentBits, Interaction } from 'discord.js';
import { UnexpectedElseLogicalError } from '../Error/index.js';
import { LoadDiscordUserData } from '../Load/LoadDiscordUserData.js';
import { MainFileLoad } from '../Load/MainFileLoad.js';
import { ShareObject } from '../ShareObject/ShareObject.js';
import { DiscordMessage } from '../Util/ConsoleMessages.js';
import Logger from '../Util/Logger.js';
import { CommandObject } from '../Util/MainClass/CommandObject.js';
import { ExecuteConditionResult } from '../Util/MainClass/EventClassBase.js';
import {
  AutoCompleteInteractionCreateEventClass,
  ButtonInteractionCreateEventClass,
  ChatInputInteractionCreateEventClass,
  InteractionCreateEventBaseClass,
  ModalSubmitInteractionCreateEventClass,
  SelectMenuInteractionCreateEventClass,
} from '../Util/MainClass/InteractionCreateEventClass.js';
import SetCommand from '../Util/MainClass/SetCommand.js';
import InteractionWrapperOperation from '../Wrapper/interaction/InteractionWrapperOperation.js';
import MessagePayloadOptionWrapper from '../Wrapper/message/MessagePayloadWrapper.js';
import { EnvironmentType, config } from '../config/config.js';
import { discordIds } from '../config/discordIds.js';
import { clientOnInterface } from './clientOn.js';
import { eventClassExecute } from './onBase.js';
import InteractionWrapper from '../Wrapper/interaction/interactionWrapper.js';

const classLists = {
  autoComplete: [] as AutoCompleteInteractionCreateEventClass<boolean>[],
  button: [] as ButtonInteractionCreateEventClass<boolean>[],
  chatInput: [] as ChatInputInteractionCreateEventClass<boolean, CommandObject | null>[],
  command: [] as SetCommand[],
  modalSubmit: [] as ModalSubmitInteractionCreateEventClass<boolean>[],
  selectMenu: [] as SelectMenuInteractionCreateEventClass<boolean>[],
};

/**
 * interaction実行時にエラーが生じた際に呼ばれる関数です。
 * interactionがメッセージ送信可能な場合、エラーメッセージを送信します。
 * その後、エラーメッセージをログに出力もしくはエラーを投げます。
 * @param e エラー
 * @param interactionWrapper interactionのラッパー
 */
const eventClassExecuteResultError = async (e: Error, interactionWrapper: InteractionWrapper) => {
  if (InteractionWrapperOperation.isMessageAble(interactionWrapper)) {
    interactionWrapper.addMessage(
      MessagePayloadOptionWrapper.createBase(DiscordMessage.FailedCommandAsError),
    );
    await interactionWrapper.send();
  } else if (InteractionWrapperOperation.isAutoComplete(interactionWrapper)) {
    await interactionWrapper.sendOptions([
      {
        name: DiscordMessage.FailedAutoComplete,
        value: 'error',
      },
    ]);
  }
  if (config.Environment !== 'production') {
    throw e;
  } else {
    // 本番環境でのエラーはログ出力する
    Logger.error('system', e);
  }
};

/**
 * interaction実行時に成功した際に呼ばれる関数です。
 * interactionがメッセージ送信可能な場合、メッセージを送信します。
 * @param result undefined
 * @param interactionWrapper interactionのラッパー
 */
const eventClassExecuteResultSuccess = async (
  result: unknown,
  interactionWrapper: InteractionWrapper,
) => {
  if (InteractionWrapperOperation.isMessageAble(interactionWrapper)) {
    await interactionWrapper.send();
  }
};

/**
 * interaction実行時にrejectした際に呼ばれる関数です。
 * @param rejectResult rejectした結果の配列
 * @param interactionWrapper interactionのラッパー
 */
const eventClassExecuteResultReject = async (
  rejectResult: Exclude<ExecuteConditionResult, 'running' | 'done'>[],
  interactionWrapper: InteractionWrapper,
) => {
  // resultに応じて処理を分岐
  if (rejectResult.includes(ExecuteConditionResult.data)) {
    // userDataが無くて処理できなかった時
    if (InteractionWrapperOperation.isMessageAble(interactionWrapper)) {
      interactionWrapper.addMessage(
        MessagePayloadOptionWrapper.createBase(DiscordMessage.FailedCommandAsNoUserData),
      );
      await interactionWrapper.send();
    } else if (InteractionWrapperOperation.isAutoComplete(interactionWrapper)) {
      await interactionWrapper.sendOptions([
        {
          name: DiscordMessage.NeedUserDataForAutoComplete,
          value: 'error',
        },
      ]);
    }
  } else if (rejectResult.findIndex((v) => v !== ExecuteConditionResult.name) === -1) {
    // 全てのインタラクション名が異なった場合(適切なインタラクションが見つからなかった時)
    // eslint-disable-next-line no-lonely-if
    if (config.Environment !== 'production') {
      throw new UnexpectedElseLogicalError(
        `該当するインタラクション名がありません。${interactionWrapper.getInteractionName()}`,
      );
    }
  } else {
    // ここには到達しないはず
    throw new UnexpectedElseLogicalError();
  }
};

const onInteractionCreate = async (shareObject: ShareObject, interaction: Interaction) => {
  const interactionWrapper = InteractionWrapperOperation.CreateWrapper(interaction);
  const userData = await LoadDiscordUserData(
    shareObject.guildOperation,
    interactionWrapper.getGuildId(),
    interactionWrapper.getDiscordId(),
  );
  Logger.outputToDebuglog('Event', () => [
    `OnInteractionCreate.execute called. ID: ${interactionWrapper.getInteractionId()}`,
  ]);

  const classList = (() => {
    if (InteractionWrapperOperation.isAutoComplete(interactionWrapper)) {
      return classLists.autoComplete;
    }
    if (InteractionWrapperOperation.isButton(interactionWrapper)) {
      return classLists.button;
    }
    if (InteractionWrapperOperation.isChatInputCommand(interactionWrapper)) {
      return classLists.chatInput;
    }
    if (InteractionWrapperOperation.isModalSubmit(interactionWrapper)) {
      return classLists.modalSubmit;
    }
    if (InteractionWrapperOperation.isSelectMenu(interactionWrapper)) {
      return classLists.selectMenu;
    }
    throw new UnexpectedElseLogicalError(interactionWrapper.constructor.name);
  })();

  await eventClassExecute<
    void,
    InteractionCreateEventBaseClass<boolean>
  >({
    eventClass: classList,
    classArgs: [shareObject, userData, interactionWrapper],
    resultError: async (e) => {
      await eventClassExecuteResultError(e, interactionWrapper);
    },
    resultSuccess: async (result) => {
      await eventClassExecuteResultSuccess(result, interactionWrapper);
    },
    resultReject: async (rejectResult) => {
      await eventClassExecuteResultReject(rejectResult, interactionWrapper);
    },
  });
};

const loadSlashCommand = async (shareObject: ShareObject, guildId: string) => {
  const { application } = shareObject.client;

  if (application) {
    // MEMO: セットはコマンドに変更があった時だけの方が良い？
    await application.commands.set(
      classLists.command.map((v) => v.command),
      guildId,
    );
  }
};

/**
 * interactionのmainディレクトリを読み込み、反映させます。
 * @param environment 実行環境
 */
const loadInteractionMain = async (environment: EnvironmentType) => {
  const load = await MainFileLoad<InteractionCreateEventBaseClass<boolean>>(
    environment,
    InteractionCreateEventBaseClass.DirectoryName,
    InteractionCreateEventBaseClass,
  );
  load.forEach((v) => {
    if (v instanceof AutoCompleteInteractionCreateEventClass) {
      classLists.autoComplete.push(v);
    } else if (v instanceof ButtonInteractionCreateEventClass) {
      classLists.button.push(v);
    } else if (v instanceof ChatInputInteractionCreateEventClass) {
      classLists.chatInput.push(v);
    } else if (v instanceof SetCommand) {
      classLists.command.push(v);
    } else if (v instanceof ModalSubmitInteractionCreateEventClass) {
      classLists.modalSubmit.push(v);
    } else if (v instanceof SelectMenuInteractionCreateEventClass) {
      classLists.selectMenu.push(v);
    } else {
      throw new UnexpectedElseLogicalError(v.constructor.name);
    }
  });
};

const onInteraction: clientOnInterface = {
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [],
  execute: async (shareObject) => {
    // Main/interactionディレクトリの読み込み
    await loadInteractionMain(config.Environment);

    // スラッシュコマンドの登録
    await loadSlashCommand(shareObject, discordIds.MainServerId);

    // イベントの登録
    shareObject.client.on(Events.InteractionCreate, async (interaction) => {
      await shareObject.activeCodeCount.activate(onInteractionCreate, shareObject, interaction);
    });
  },
};

export default onInteraction;
