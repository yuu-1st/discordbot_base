/**
 * discord botのconfig関連です。
 */
export type configSatisfies = {
  /** discordのトークン */
  DiscordBotToken: string;
  /** 実行環境 */
  Environment: 'env' | 'production';
};

/*
  実装例:
  src/config/Implement/config.ts
*/
/*

import { configSatisfies } from '../Interface/config.js';

const config = {
  DiscordBotToken: '',
  Environment: 'env',
} as const satisfies configSatisfies;

export default config;

*/
