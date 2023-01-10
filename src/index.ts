import ConnectDiscord from './ShareObject/discordjs.js';
import { UtilObjectInstance } from './ShareObject/ShareObject.js';

async function main() {
  // 共通オブジェクトの作成
  const shareObject = UtilObjectInstance();

  // discord botを生成します。
  await ConnectDiscord(shareObject);
}

await main();
