import { Collection } from 'discord.js';

/**
 * discordのサーバーidもしくはチャンネルid、絵文字idなどの変化しないidを埋め込みで実装するための型。
 * 任意の名称に、id一つ(string)もしくは配列(string[])形式、Collection形式のいずれかで設定します。
 */
export type discordIdsSatisfies = {
  [key: string]: string | string[] | Collection<string, string>;
};

/*
  実装例:
  src/config/Implement/discordIds.ts
*/
/*

import { discordIdsSatisfies } from '../Interface/discordIds.js';

const discordIds = {
  channelName: 'id',
} satisfies discordIdsSatisfies;

export default discordIds;

*/
