import { fileURLToPath } from 'url';
import { EnvironmentType } from '../config/config.js';
import { LoadFailedWrappedError } from '../Error/WrappedError.js';
import { GetDirList } from '../Util/FileOperation.js';
import Logger from '../Util/Logger.js';
import EventClassBase from '../Util/MainClass/EventClassBase.js';
import SetCommand from '../Util/MainClass/SetCommand.js';
import { NonNullablesFilter } from '../Util/TypeGuard.js';

const filename = fileURLToPath(import.meta.url);

export const EnvironmentDefault: EnvironmentType[] = ['env', 'production'];

const environmentCheck = <T extends EventClassBase<boolean>>(
  environment: EnvironmentType,
  eventClass: T,
): boolean => {
  const loadingEnvironment = eventClass.loadingEnvironment ?? EnvironmentDefault;
  if (loadingEnvironment.findIndex((t) => t === environment) === -1) {
    return false;
  }
  return true;
};

/**
 * src/Main以下の指定ディレクトリから動的読み込みを行い、現在の実行環境で読み込み可能指定されているもののみ出力します。
 * @param environment 現在の実行環境
 * @param dirname 指定のディレクトリ名
 * @param className 指定のインスタンス
 * @returns
 * @throws LoadFailedWrappedError ファイルが読み込めなかった場合
 */
const MainFileLoad = async <T extends EventClassBase<boolean> | SetCommand>(
  environment: EnvironmentType,
  dirname: string,
  className: abstract new (...arg: any) => T,
): Promise<T[]> => {
  const isTS = !!filename.endsWith('.ts');

  const path = `${isTS ? 'src' : 'dist'}/Main`;

  const mainDirList = await GetDirList(path);

  const targetFileList = await Promise.all(
    mainDirList.map(async (list) => {
      if (list.isDirectory()) {
        const targetDirPath = `${path}/${list.name}/${dirname}`;
        const dirList = await GetDirList(targetDirPath).catch((e) => {
          // ディレクトリが存在しないときは空配列、それ以外は例外をそのまま投げる
          if (e && e instanceof LoadFailedWrappedError) {
            return [];
          }
          throw e;
        });
        const fileList = dirList.map((l) => {
          if (l.isFile() && l.name.endsWith(isTS ? '.ts' : '.js')) {
            return `./../Main/${list.name}/${dirname}/${l.name}`;
          }
          return null;
        });
        return fileList;
      }
      return [];
    }),
  );

  const targetFileListFlat = NonNullablesFilter(targetFileList.flat());

  const loadObject: T[] = [];

  await Promise.all(
    targetFileListFlat.map(async (name) => {
      const results = await (async () => {
        const req: unknown = await import(name);
        if (req && typeof req === 'object' && 'default' in req) {
          if (req.default instanceof className) {
            if (environmentCheck(environment, req.default)) {
              loadObject.push(req.default);
              return true;
            }
            return 'env';
          }
          if (req.default instanceof Array) {
            const m = req.default.map((v) => {
              if (v instanceof className) {
                if (environmentCheck(environment, v)) {
                  loadObject.push(v);
                  return true;
                }
                return 'env';
              }
              return false;
            });
            return m;
          }
          return false;
        }
        return 'Error';
      })();

      /* ログ用 */
      Logger.outputToDebuglog('File', () => {
        const message = [`[${dirname}]`, `ファイル「${name.replace('./../Main/', '')}」=>`];
        let count = 0;
        if (results instanceof Array) {
          const iList = results
            .map((v) => {
              if (v === true) {
                return ['○'];
              }
              count += 1;
              if (v === false) {
                return ['型'];
              }
              return ['環'];
            })
            .join(', ');
          if (count > 0) {
            message.push(`配列読み込みの結果です。[${iList}]`);
          } else {
            message.push('全ての配列を読み込みました。');
          }
        } else if (typeof results === 'boolean') {
          if (results === false) {
            message.push('型違いでスキップしました。');
          } else {
            message.push('読み込みました。');
          }
        } else if (results === 'env') {
          message.push('実行環境違いでスキップしました。');
        } else if (results === 'Error') {
          message.push('default exportを確認できませんでした。');
        }
        return message;
      });
    }),
  );

  return NonNullablesFilter(loadObject);
};

export { MainFileLoad };
