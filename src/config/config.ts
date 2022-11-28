import { env } from 'process';
import { parse } from 'jsonc-parser';
import z from 'zod';
import { FailedValidateRuntimeError } from '../Error/RuntimeError.js';
import { FileRead } from '../Util/FileOperation.js';

/**
 * config.jsonの型の定義から、読み込み、出力までを行います。
 *
 * configの追加方法：
 *  - configTypeObjectにプロパティ名と対応する型を記述
 *  - 以上。
 *
 * ファイルの読み込み箇所：
 *  - デフォルトはディレクトリ直下の'config.jsonc'
 *  - env.configPathを指定することで、任意の箇所からインポートすることが出来る。
 *  - ※ファイルが読み込めなかったときは、LoadFailedWrappedErrorを投げます。
 */

/**
 * configに使用する変数の指定。型はzodに基づいて指定します。
 */
const configTypeObject = z.object({
  /** discordのトークン */
  DiscordBotToken: z.string(),
  /** 実行環境 */
  Environment: z.enum(['test', 'env', 'production']),
  /** debuglogに出力するデータ。本番環境はoffが推奨 */
  Debuglog: z.enum([
    /** 全て */
    'all',
    /** info以上。 */
    'info',
    /** info以上と、File読み込み関連のdebug */
    'debugFile',
    /** info以上と、Event実行関連のdebug */
    'debugEvent',
    /** 出力しない。 */
    'off',
  ]),
});

type configType = z.infer<typeof configTypeObject>;

export type EnvironmentType = configType['Environment'];

const loadConfigPath = (() => {
  if (env.configPath) {
    return env.configPath;
  }
  return './config.jsonc';
})();

const configData = await FileRead(loadConfigPath);

const configJson = (() => {
  try {
    return parse(configData);
  } catch (e) {
    throw new FailedValidateRuntimeError(e);
  }
})();

const decoded = (() => {
  try {
    return configTypeObject.parse(configJson);
  } catch (e) {
    throw new FailedValidateRuntimeError(e);
  }
})();

/**
 * discord botのconfig関連です。
 */
export const config = decoded;
