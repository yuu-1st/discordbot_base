import { Client } from 'discord.js';
import { ImpartialRequire, PartialRequire } from '../Util/util.js';
import { configLoad, discordIdsLoad } from './configLoad.js';

/**
 * 共通要素を持ったオブジェクト
 */
export type ShareObject = {
  client: Client;
  config: ReturnType<typeof configLoad>;
  discordIds: ReturnType<typeof discordIdsLoad>;
};

/**
 * ShareObjectのすべての要素をオプショナルにしたもの
 */
export type OptionalShareObject = Partial<ShareObject>;

/**
 * ShareObjectの特定の要素を必須要素にしたもの
 */
export type PartialShareObject<R extends keyof ShareObject> = PartialRequire<
  OptionalShareObject,
  R
>;

/**
 * ShareObjectの特定の要素だけをオプショナルにしたもの
 */
export type ImpartialShareObject<R extends keyof ShareObject> = ImpartialRequire<
  OptionalShareObject,
  R
>;

/**
 * 共通オブジェクトをまとめて生成します。
 * @returns
 */
export const UtilObjectInstance = (): ImpartialShareObject<'client'> => {
  const object: ImpartialShareObject<'client'> = {
    config: configLoad(),
    discordIds: discordIdsLoad(),
  };
  return object;
};
