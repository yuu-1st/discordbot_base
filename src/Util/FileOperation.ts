import fs from 'fs/promises';

const encoding = 'utf-8' as const;

/**
 * ファイルを読み込みます。
 * @param filePath 実行ディレクトリからの相対パス
 * @returns ファイル内容
 * @throw ファイルが読み込めなかった場合
 */
export async function FileRead(filePath: string): Promise<string> {
  try {
    return fs.readFile(filePath, encoding);
  } catch (e) {
    if (e instanceof AggregateError || e instanceof Error) {
      throw new Error(e.message);
    } else {
      throw new Error();
    }
  }
}

/**
 * ファイルに書き込みます。
 * @param filePath 実行ディレクトリからの相対パス
 * @param data 書き込み内容
 * @returns
 * @throw ファイルが書き込めなかった場合
 */
export async function FileWrite(filePath: string, data: string): Promise<void> {
  try {
    return fs.writeFile(filePath, data, encoding);
  } catch (e) {
    if (e instanceof AggregateError || e instanceof Error) {
      throw new Error(e.message);
    } else {
      throw new Error();
    }
  }
}
