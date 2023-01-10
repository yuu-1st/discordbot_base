/**
 * メッセージを出力する用。
 * discord.js/src/errors/Messagesのメッセージオブジェクトと同じように扱える型になっています。
 */
type messageListSatisfies = {
  [key: string]: string | ((...arg: string[]) => string);
};

/**
 * コンソールに出力するメッセージ
 */
export const ConsoleMessage = {} as const satisfies messageListSatisfies;

/**
 * discordにbotのメッセージとして出力する内容
 */
export const DiscordMessage = {} as const satisfies messageListSatisfies;
