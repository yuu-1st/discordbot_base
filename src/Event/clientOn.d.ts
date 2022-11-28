import { GatewayIntentBits, Partials } from 'discord.js';
import { ShareObject } from '../ShareObject/ShareObject.js';

interface clientOnInterface {
  /** 必要なintentsを記述します。 */
  intents: GatewayIntentBits[];
  /** 必要なPartialsを記述します。 */
  partials: Partials[];
  /**
   * イベントを発行します。
   * @param shareObject 共有オブジェクト
   */
  execute(shareObject: ShareObject): void;
}
