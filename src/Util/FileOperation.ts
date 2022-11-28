import { Dirent } from 'fs';
import fs from 'fs/promises';
import { handleUnknownError, LoadFailedWrappedError } from '../Error/index.js';

const encoding = 'utf-8' as const;

/**
 * ファイルを読み込みます。
 * @param filePath 実行ディレクトリからの相対パス
 * @returns ファイル内容
 * @throws LoadFailedWrappedError ファイルが読み込めなかった場合
 */
export async function FileRead(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, encoding);
  } catch (e) {
    throw handleUnknownError(e, (err) => {
      throw new LoadFailedWrappedError(err);
    });
  }
}

/**
 * ファイルに書き込みます。
 * @param filePath 実行ディレクトリからの相対パス
 * @param data 書き込み内容
 * @returns void
 * @throws LoadFailedWrappedError ファイルが書き込めなかった場合
 */
export async function FileWrite(filePath: string, data: string): Promise<void> {
  try {
    return await fs.writeFile(filePath, data, encoding);
  } catch (e) {
    throw handleUnknownError(e, (err) => {
      throw new LoadFailedWrappedError(err);
    });
  }
}

/**
 * 指定のディレクトリの一覧を取得します
 * @param dirPath 指定するディレクトリ
 * @returns ディレクトリ一覧
 * @throws LoadFailedWrappedError ファイルが読み込めなかった場合
 */
export async function GetDirList(dirPath: string): Promise<Dirent[]> {
  try {
    return await fs.readdir(dirPath, { withFileTypes: true });
  } catch (e) {
    throw handleUnknownError(e, (err) => {
      throw new LoadFailedWrappedError(err);
    });
  }
}
