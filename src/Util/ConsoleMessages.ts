/* eslint-disable jsdoc/require-returns, jsdoc/require-param */

/**
 * メッセージを出力する用。
 * discord.js/src/errors/Messagesのメッセージオブジェクトと同じように扱える型になっています。
 */
type messageListSatisfies = {
  [key: string]: string | ((...arg: any[]) => string);
};

/**
 * 固有名詞
 */
export const SpecificWord = {} as const satisfies messageListSatisfies;

/**
 * コンソールに出力するメッセージ
 */
export const ConsoleMessage = {
  /** ロールが見つかりませんでした。ロール名：${roleName} */
  NotFoundRole: (roleName: string) => `ロールが見つかりませんでした。ロール名：${roleName}`,
  /** データが見つかりませんでした。オブジェクト：${object}、検索文字列：${string} */
  NotFoundData: (object: string, string: string) => `データが見つかりませんでした。オブジェクト：${object}、検索文字列：${string}`,
} as const satisfies messageListSatisfies;

/**
 * discordにbotのメッセージとして出力する内容
 */
export const DiscordMessage = {
  //  ************ 共通  ************  //

  // 起動しました。
  Ready: '起動しました。',
  // コマンドを実行しました！
  RunCommanded: 'コマンドを実行しました！',
  FailedCommand: 'コマンド実行に失敗しました。',
  CommandRunning: 'コマンドの実行中です・・・。',
  FailedCommandAsError: 'エラーが発生したため、コマンド実行に失敗しました。',
  FailedCommandAsNoUserData: 'ユーザー情報が見つからなかったため、コマンド実行に失敗しました。',
  /** ロール「${name}」を付与しました！ */
  AddRole: (name: string) => `ロール「${name}」を付与しました！`,
  /** ロール「${name}」を削除しました！ */
  RemoveRole: (name: string) => `ロール「${name}」を削除しました！`,
  /** ロール「${name}」の付与もしくは削除に失敗しました。 */
  FailedRole: (name: string) => `ロール「${name}」の付与もしくは削除に失敗しました。`,
  UnderConstruction: '準備中です・・・',
  NeedUserDataForAutoComplete: 'このオートコンプリートにはユーザー情報が必要です。',
  FailedAutoComplete: 'エラーが発生したため、オートコンプリートを読み込めませんでした。',
  /** ユーザー情報が見つかりませんでした。ユーザー名：${userName} */
  NotFoundUserData: (userName?: string) =>
    `ユーザー情報が見つかりませんでした。${userName ? `ユーザー名：${userName}` : ''}`,
  /** ロール情報が見つかりませんでした。ロール名：${roleName} */
  NotFoundRoleData: (roleName: string) => `ロール情報が見つかりませんでした。ロール名：${roleName}`,
  RegisterData: 'データを登録しました！',
  /** 権限不足のため、${feature}に失敗しました。 */
  FailedFeature: (feature: string) => `権限不足のため、${feature}に失敗しました。`,
} as const satisfies messageListSatisfies;
