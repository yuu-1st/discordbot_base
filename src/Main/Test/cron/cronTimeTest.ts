import Logger from '../../../Util/Logger.js';
import CronEventClass from '../../../Util/MainClass/CronEventClass.js';

const loadingEnvironment = ['test' as const];

const event = new CronEventClass({
  cronTime: '5minute',
  loadingEnvironment,
  main: async (_, time) => {
    Logger.debug('default', `5minute cron. time: ${time.format('YYYY-MM-DD HH:mm:ss')}`);
  },
});

const event2 = new CronEventClass({
  cronTime: 'hour',
  loadingEnvironment,
  main: async (_, time) => {
    Logger.debug('default', `hour cron. time: ${time.format('YYYY-MM-DD HH:mm:ss')}`);
  },
});

const event3 = new CronEventClass({
  cronTime: 'day',
  loadingEnvironment,
  main: async (_, time) => {
    Logger.debug('default', `day cron. time: ${time.format('YYYY-MM-DD HH:mm:ss')}`);
  },
});

const event4 = new CronEventClass({
  cronTime: 'shutdown',
  loadingEnvironment,
  main: async (_, time) => {
    Logger.debug('default', `shutdown cron. time: ${time.format('YYYY-MM-DD HH:mm:ss')}`);
  },
});

const event5 = new CronEventClass({
  cronTime: 'startup',
  loadingEnvironment,
  main: async (_, time) => {
    Logger.debug('default', `startup cron. time: ${time.format('YYYY-MM-DD HH:mm:ss')}`);
  },
});

export default [event, event2, event3, event4, event5];
