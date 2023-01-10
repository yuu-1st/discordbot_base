import config from '../config/Implement/config.js';
import discordIds from '../config/Implement/discordIds.js';
import { configSatisfies } from '../config/Interface/config.js';
import { discordIdsSatisfies } from '../config/Interface/discordIds.js';

/**
 * config/Implement/config.tsを読み込みます
 */
export const configLoad = () => {
  const conf = config satisfies configSatisfies;
  return conf;
};

/**
 * config/Implement/discordIds.tsを読み込みます
 */
export const discordIdsLoad = () => {
  const ids = discordIds satisfies discordIdsSatisfies;
  return ids;
};
