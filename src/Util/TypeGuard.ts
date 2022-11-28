import dayjs from 'dayjs';
import { Collection } from 'discord.js';
import { z } from 'zod';

/**
 * 配列からnullとundefinedを取り除きます
 * @param item 配列
 * @returns nullとundefinedがない配列
 */
export const NonNullablesFilter: {
  <T>(item: T[]): NonNullable<T>[];
  <K, T>(item: Collection<K, T>): Collection<K, NonNullable<T>>;
} = (item: any) => {
  const filtered = item.filter((v: unknown) => {
    if (v === null) {
      return false;
    }
    if (v === undefined) {
      return false;
    }
    return true;
  });
  return filtered;
};

/**
 * dayjs の validate。存在しない日付対策付き
 * @param date 日付
 * @param format フォーマット。デフォルトはYYYY-MM-DD HH:mm:ss
 * @returns validate結果
 * @see {@link https://qiita.com/kubotak/items/3bbde3c976606493060d 参考元}
 */
export const dayjsValidate = (date: string, format: string = 'YYYY-MM-DD HH:mm:ss') =>
  dayjs(date, format).format(format) === date;

/**
 * dayjsの型をzodで定義する時の型
 */
export const zodDayjs = z.preprocess(
  (value) => typeof value === 'string' && dayjsValidate(value) && dayjs(value),
  z.instanceof(dayjs as any as typeof dayjs.Dayjs),
);

/**
 * テーブルの型としてbooleanを使う時の型(取得時、0,1をbooleanに変換する)
 */
export const zodDatabaseBoolean = z.preprocess((value) => {
  if (value === 1) {
    return true;
  }
  if (value === 0) {
    return false;
  }
  return value;
}, z.boolean());

/**
 * 判別可能なユニオンの分割代入をしやすくするための型
 * @example
 * type A = { a: string; b: number };
 * type B = { a: string; c: number };
 * type C = FillKeys<A | B>;
 * // type C = { a: string; b: number; c?: undefined } | { a: string; b?: undefined; c: number }
 * @see {@link https://qiita.com/suin/items/da635d4112ff51eead68 参考元}
 */
export type FillKeys<T> = (
  (T extends T ? keyof T : never) extends infer AllKeys
    ? T extends T
      ? { [K in keyof T]: T[K] } & {
          [K in AllKeys extends keyof T
            ? never
            : AllKeys extends string
            ? AllKeys
            : never]?: undefined;
        }
      : never
    : never
) extends infer V
  ? { [K in keyof V]: V[K] }
  : never;

/**
 * 配列の値をユニオン型とした配列を引数に取り、
 * チェック対象の値が配列に含まれているかどうかを返します
 * @param array チェック対象の配列
 * @param value チェック対象の値
 * @returns チェック対象の値が配列に含まれているかどうか
 */
export function isIncludeConstArray<const T>(array: T[], value: any): value is T {
  return array.includes(value);
}

/**
 * オブジェクトを引数に取り、
 * チェック対象の値がオブジェクトのキーに含まれているかどうかを返します
 * @param object チェック対象のオブジェクト
 * @param value チェック対象の値
 * @returns チェック対象の値がオブジェクトのキーに含まれているかどうか
 */
export function isIncludeConstObject<T extends Record<string, any>, U extends keyof T>(
  object: T,
  value: any,
): value is U {
  return value in object;
}

/**
 * オブジェクトのキー一覧を取得します(Object.keys()の型安全版)
 * @param object オブジェクト
 * @returns オブジェクトのキー一覧
 */
export function ObjectKeys<T extends Record<string, any>>(object: T): (keyof T)[] {
  return Object.keys(object).filter((key) => isIncludeConstObject(object, key));
}
