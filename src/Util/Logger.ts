import log4js, { Appender } from 'log4js';

type Appenders = 'out' | 'system';

type Categories = 'default' | 'system';

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
   * @returns
   */
  private static instance = (category: Categories): log4js.Logger => {
    if (!Logger.isConfigure) {
      const appenders: AppendersObject = {
        out: {
          type: 'stdout',
          layout: {
            type: 'pattern',
            pattern: '%d{yyyy-MM-dd hh:mm:ss} [%c] [%p] %m',
          },
        },
        system: {
          type: 'dateFile',
          filename: 'logs/system.log',
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
   * @returns
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
