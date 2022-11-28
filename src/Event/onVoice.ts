import { Events, GatewayIntentBits, VoiceState } from 'discord.js';
import { LoadDiscordUserData } from '../Load/LoadDiscordUserData.js';
import { MainFileLoad } from '../Load/MainFileLoad.js';
import { ShareObject } from '../ShareObject/ShareObject.js';
import Logger from '../Util/Logger.js';
import { VoiceStateEventClass } from '../Util/MainClass/VoiceStateEventClass.js';
import VoiceStateUpdateWrapper from '../Wrapper/voice/VoiceStateUpdateWrapper.js';
import { EnvironmentType, config } from '../config/config.js';
import { clientOnInterface } from './clientOn.js';
import { eventClassExecute } from './onBase.js';

const classList = {
  stateUpdate: [] as VoiceStateEventClass<boolean>[],
};

const onVoiceStateUpdate = async (
  shareObject: ShareObject,
  oldState: VoiceState,
  newState: VoiceState,
) => {
  const stateWrapper = new VoiceStateUpdateWrapper(oldState, newState);
  const userData = await LoadDiscordUserData(
    shareObject.guildOperation,
    stateWrapper.guildId,
    stateWrapper.userId,
  );
  Logger.outputToDebuglog('Event', () => [
    `onVoiceStateUpdate.execute called. ID: ${stateWrapper.originalSnowflakeId}`,
  ]);

  await eventClassExecute({
    eventClass: classList.stateUpdate,
    classArgs: [shareObject, userData, stateWrapper],
  });
};

const loadVoiceMain = async (environment: EnvironmentType) => {
  const load = await MainFileLoad<VoiceStateEventClass<boolean>>(
    environment,
    VoiceStateEventClass.DirectoryName,
    VoiceStateEventClass,
  );
  // load.forEach((v) => {
  //   if (v instanceof VoiceStateEventClass) {
  //     classList.stateUpdate.push(v);
  //   } else {
  //     throw new UnexpectedElseLogicalError(v.constructor.name);
  //   }
  // });
  classList.stateUpdate.push(...load);
  return {
    onVoiceStateUpdate,
  };
};

const onVoice: clientOnInterface = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [],
  execute: async (shareObject) => {
    // Main/voiceディレクトリの読み込み
    await loadVoiceMain(config.Environment);

    // イベントの登録
    shareObject.client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
      await shareObject.activeCodeCount.activate(
        onVoiceStateUpdate,
        shareObject,
        oldState,
        newState,
      );
    });
  },
};

export default onVoice;
