import { Client } from 'discord.js';
import { ImpartialRequire, PartialRequire } from '../Util/util.js';
import ActiveCodeCount from './ActiveCodeCount.js';
import SelfOperation from './SelfOperation.js';
import GuildOperation from './GuildOperation.js';

/**
 * 共通要素を持ったオブジェクト
 */
export type ShareObject = {
  client: Client<true>;
  selfOperation: SelfOperation;
  guildOperation: GuildOperation;
  activeCodeCount: ActiveCodeCount;
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
 * @returns 共通オブジェクト
 */
export const UtilObjectInstance = () => {
  const object: ImpartialShareObject<'client' | 'selfOperation' | 'activeCodeCount' | 'guildOperation'> = {};
  return object;
};
