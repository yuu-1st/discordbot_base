import { env } from 'process';
import { parse } from 'jsonc-parser';
import { z } from 'zod';
import { FailedValidateRuntimeError } from '../Error/RuntimeError.js';
import { FileRead } from '../Util/FileOperation.js';

/**
 * discordIds.jsonの型の定義から、読み込み、出力までを行います。
 *
 * discordIdsの追加方法：
 *  - discordIdsTypeObjectにプロパティ名と対応する型を記述
 *  - 以上。
 *
 * ファイルの読み込み箇所：
 *  - デフォルトはディレクトリ直下の'discordIds.jsonc'
 *  - env.discordIdsPathを指定することで、任意の箇所からインポートすることが出来る。
 *  - ※ファイルが読み込めなかったときは、LoadFailedWrappedErrorを投げます。
 */

/**
 * discordIdsに使用する変数の指定。型はzodに基づいて指定します。
 */
const discordIdsTypeObject = z.object({
  /** メインサーバーのId */
  MainServerId: z.string(),
  /** bot管理人のId */
  OwnerDiscordId: z.string(),
  /** ログチャンネルのId */
  LogChannelId: z.string(),
});

const loadDiscordIdsPath = (() => {
  if (env.discordIdsPath) {
    return env.discordIdsPath;
  }
  return './discordIds.jsonc';
})();

const discordIdsData = await FileRead(loadDiscordIdsPath);

const decoded = (() => {
  try {
    const json = parse(discordIdsData);
    return discordIdsTypeObject.parse(json);
  } catch (e) {
    throw new FailedValidateRuntimeError(e);
  }
})();

/**
 * discord botのdiscordIds関連です。
 */
// eslint-disable-next-line import/prefer-default-export
export const discordIds = decoded;
