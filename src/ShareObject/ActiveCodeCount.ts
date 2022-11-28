import EventEmitter from 'events';
import { exit } from 'process';
import { onCronExecute } from '../Event/cron.js';
import Logger from '../Util/Logger.js';
import { ShareObject } from './ShareObject.js';

/**
 * 非同期プログラムの実行数を管理するクラスです。
 *
 * シャットダウンコマンドを実行する際、非同期プログラムが終了するまで待機させるため、このクラスを使用します。
 */
class ActiveCodeCount {
  private count = 0;

  private eventEmitter: EventEmitter;

  /**
   * 非同期プログラムの実行数を管理するクラスを初期化します。
   */
  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  /**
   * 非同期プログラムを実行する際に呼び出します。
   * この関数を介さずに実行されている非同期プログラムは、shutdownコマンドによるシャットダウンで強制終了される可能性があります。
   * @param func 呼び出す関数
   * @param args funcの引数(必要であれば)
   * @returns funcの戻り値
   */
  activate = async <A extends unknown[], R>(
    func: (...arg: A) => Promise<R>,
    ...args: A
  ): Promise<R> => {
    this.count += 1;
    this.eventEmitter.emit('activate');
    try {
      return await func(...args);
    } finally {
      this.count -= 1;
      this.eventEmitter.emit('inactivate');
    }
  };

  /**
   * プログラムを正常終了させます。
   * ※この関数をawaitすると、無限ループで終了しなくなります。
   * @param shareObject 共有オブジェクト
   */
  shutdown = async (shareObject: ShareObject): Promise<never> => {
    Logger.info('system', 'シャットダウン処理を開始します。');
    // discord側からイベントが来ないようにする
    shareObject.client.removeAllListeners();
    // すべての非同期プログラムが終了するまで待機する
    while (this.count > 0) {
      await new Promise((resolve) => {
        this.eventEmitter.once('inactivate', resolve);
      });
      Logger.debug('system', '残りプログラム数:', this.count);
    }
    await onCronExecute(shareObject, 'shutdown');

    await shareObject.client.destroy();
    Logger.info('system', 'シャットダウンします。');
    await Logger.shutdown();
    exit(0);
  };
}

export default ActiveCodeCount;
