import log4js, { Appender } from 'log4js';
import { config } from '../config/config.js';

/** 出力形式 */
type Appenders = 'out' | 'system' | 'debuglog' | 'action' | 'message';

/** 種類 */
type Categories = 'default' | 'system' | 'debuglog' | 'action' | 'message';

type DebuglogCategories = 'File' | 'Event';

type AppendersObject = {
  [key in Appenders]: Appender;
};

type CategoriesObject = {
  [key in Categories]: {
    appenders: Appenders[];
    level: string;
    enableCallStack?: boolean;
  };
};

/**
 * ログを出力するためのクラス。
 */
class Logger {
  /**
   * log4jsのconfigureを設定したかどうか
   */
  private static isConfigure: boolean = false;

  /**
   * log4jsのconfigureを設定し、該当するカテゴリのloggerを返します。
   * @param category 出力先のカテゴリ
   * @returns logger
   */
  private static instance = (category: Categories): log4js.Logger => {
    if (!Logger.isConfigure) {
      const appenders: AppendersObject = {
        out: {
          type: 'stdout',
          layout: {
            type: 'pattern',
            pattern: '%[%d{yyyy-MM-dd hh:mm:ss.SSS} [%c] [%p] %]%m',
          },
        },
        system: {
          type: 'dateFile',
          filename: 'logs/system/system.log',
          pattern: 'yyyy-MM-dd',
          layout: {
            type: 'pattern',
            pattern: '[%d] [%p] %m',
          },
          compress: true,
          keepFileExt: true,
          numBackups: 31,
        },
        debuglog: {
          type: 'dateFile',
          filename: 'logs/debuglog/debuglog.log',
          pattern: 'yyyy-MM-dd',
          layout: {
            type: 'pattern',
            pattern: '[%d] [%p] %m',
          },
          compress: true,
          keepFileExt: true,
          numBackups: 10,
        },
        action: {
          type: 'dateFile',
          filename: 'logs/action/action.log',
          pattern: 'yyyy-MM-dd',
          layout: {
            type: 'pattern',
            pattern: '[%d] [%p] %m',
          },
          compress: true,
          keepFileExt: true,
          numBackups: 31,
        },
        message: {
          type: 'dateFile',
          filename: 'logs/message/message.log',
          pattern: 'yyyy-MM-dd',
          layout: {
            type: 'pattern',
            pattern: '[%d] [%p] %m',
          },
          compress: true,
          keepFileExt: true,
          numBackups: 31,
        },
      };
      const categories: CategoriesObject = {
        // 全てのレベルのエラーを、コンソールへ出力。
        default: {
          appenders: ['out'],
          level: 'all',
        },
        // info以上のレベルのエラーを、コンソールへ出力と、system.logへ出力。
        system: {
          appenders: ['out', 'system'],
          level: config.Environment === 'production' ? 'info' : 'debug',
        },
        // 指定以上のレベルのエラーを、コンソールへ出力と、debuglog.logへ出力。
        debuglog: {
          appenders: ['out', 'debuglog'],
          level: config.Debuglog.startsWith('debug') ? 'debug' : config.Debuglog,
        },
        action: {
          appenders: ['out', 'action'],
          level: 'info',
        },
        message: {
          appenders: ['out', 'message'],
          level: 'info',
        },
      };

      log4js.configure({
        appenders,
        categories,
      });

      Logger.isConfigure = true;
    }
    return log4js.getLogger(category);
  };

  /**
   * 2つ前の呼び出し元の関数のファイル名と行数と列数を取得する
   * @example return 'ShareObject/Logger.ts:68:6'
   * @returns ファイル名と行数と列数
   */
  private static getStackTrace = (): string => {
    const { stack } = new Error();
    if (!stack) {
      return '';
    }
    const lines = stack.split('\n');
    if (!lines) {
      return '';
    }
    // Errorと書かれた行を取得する
    const errorLine = lines.findIndex((line) => line.startsWith('Error'));
    if (errorLine === -1) {
      return '';
    }
    const line = lines[errorLine + 3];
    if (!line) {
      return '';
    }
    // 後ろから2番目の「/」までを取得する
    const [fileName, dirName] = line.split('/').reverse();
    if (!fileName || !dirName) {
      return '';
    }
    // fileNameの最後が「)」の場合は削除する
    const fileNameWithoutExt = fileName.split(')')[0];
    return `${dirName}/${fileNameWithoutExt}`;
  };

  /**
   * カテゴリdebuglogのdebugログを出力します。
   * パフォーマンス維持のため、ログ出力内容を関数で渡し、出力条件を満たしていない場合は実行されません。
   * @param category 出力先カテゴリ
   * @param func 出力内容の処理。出力条件を満たしていない場合は実行されません。
   */
  static outputToDebuglog = (category: DebuglogCategories, func: () => any[]) => {
    if (config.Debuglog === 'all' || category === config.Debuglog.replace('debug', '')) {
      const args = func();
      const logger = Logger.instance('debuglog');
      logger.debug(`[${category}]`, ...args);
    }
  };

  /**
   * カテゴリactionの時間計測ログを出力します。
   * @returns 終了時に呼び出す関数
   */
  static outputToAction = () => {
    const start: number = performance.now();
    const stopFunction = (user: string, action: string, ...args: any[]) => {
      const time = performance.now() - start;
      // timeを"   0.000"形式に変換する
      const timeStr = time.toFixed(3).padStart(8, ' ');
      this.info(
        'action',
        `[${Logger.getStackTrace()}] [${user}] [${timeStr}ms] [${action}]`,
        ...args,
      );
    };
    return stopFunction;
  };

  /**
   * debugレベルのログを出力します。
   * @param category 出力先カテゴリ
   * @param args 出力内容
   */
  static debug = (category: Categories, ...args: any[]) => {
    const logger = Logger.instance(category);
    logger.debug(`[${Logger.getStackTrace()}]`, ...args);
  };

  /**
   * infoレベルのログを出力します。
   * @param category 出力先カテゴリ
   * @param args 出力内容
   */
  static info = (category: Categories, ...args: any[]) => {
    const logger = Logger.instance(category);
    logger.info(`[${Logger.getStackTrace()}]`, ...args);
  };

  /**
   * warningレベルのログを出力します。
   * @param category 出力先カテゴリ
   * @param args 出力内容
   */
  static warn = (category: Categories, ...args: any[]) => {
    const logger = Logger.instance(category);
    logger.warn(`[${Logger.getStackTrace()}]`, ...args);
  };

  /**
   * errorレベルのログを出力します。
   * @param category 出力先カテゴリ
   * @param args 出力内容
   */
  static error = (category: Categories, ...args: any[]) => {
    const logger = Logger.instance(category);
    logger.error(`[${Logger.getStackTrace()}]`, ...args);
  };

  /**
   * ログファイルをシャットダウンします。
   * @returns 成功/失敗
   */
  static shutdown = async () => {
    const a = await new Promise<boolean>((resolve) => {
      log4js.shutdown((e) => {
        if (e) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
    return a;
  };
}

export default Logger;
