import dayjs from 'dayjs';
import cron from 'node-cron';
import { MainFileLoad } from '../Load/MainFileLoad.js';
import { ShareObject } from '../ShareObject/ShareObject.js';
import Logger from '../Util/Logger.js';
import CronEventClass from '../Util/MainClass/CronEventClass.js';
import { EnvironmentType, config } from '../config/config.js';
import { clientOnInterface } from './clientOn.js';
import { eventClassExecute } from './onBase.js';

const classList = {
  cron: [] as CronEventClass[],
};

/**
 * cronイベントを実行します
 * @param shareObject 共有オブジェクト
 * @param irregular 不規則な実行を行う場合、shutdownかstartupを指定します
 */
export const onCronExecute = async (
  shareObject: ShareObject,
  irregular?: 'shutdown' | 'startup',
) => {
  Logger.outputToDebuglog('Event', () => ['cron start']);
  const time = dayjs().set('second', 0);

  await eventClassExecute({
    eventClass: classList.cron,
    classArgs: [shareObject, null, time, irregular],
  });
};

const cronInstance = async (environment: EnvironmentType) => {
  const load = await MainFileLoad<CronEventClass>(
    environment,
    CronEventClass.DirectoryName,
    CronEventClass,
  );
  classList.cron.push(...load);
  return {
    onCron: onCronExecute,
  };
};

export type onCronType = typeof onCronExecute;

const onCron: clientOnInterface = {
  intents: [],
  partials: [],
  execute: async (shareObject) => {
    // Main/cronディレクトリの読み込み
    await cronInstance(config.Environment);

    // イベントの登録
    cron.schedule('*/5 * * * *', async () => {
      await shareObject.activeCodeCount.activate(onCronExecute, shareObject);
    });

    // 起動時cronを実行する
    await shareObject.activeCodeCount.activate(onCronExecute, shareObject, 'startup');
  },
};

export default onCron;
