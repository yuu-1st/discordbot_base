/* eslint-disable max-classes-per-file */
import { GuildMember, PartialUser, RoleResolvable, User } from 'discord.js';

/**
 * PartialUserクラスのラッパークラスです。
 */
class PartialUserWrapper {
  readonly userClass: PartialUser | User;

  /**
   * constructor
   * @param user discord.jsのUserクラス
   */
  protected constructor(user: PartialUser | User) {
    this.userClass = user;
  }

  /**
   * partialUserかどうかを取得します。
   * @returns partialUserかどうか
   */
  get partial() {
    return this.userClass.partial;
  }

  /**
   * partialUserでないことを検証します。
   * @returns partialUserでないこと
   */
  isNotPartial(): this is UserWrapper {
    return !this.partial;
  }

  /**
   * discordIdを取得します
   * @returns discordId
   */
  get discordId(): string {
    return this.userClass.id;
  }

  /**
   * ユーザー名を取得します。
   * @returns ユーザー名。英数字とピリオド、アンダースコアのみで構成されますが、旧式のユーザー名の場合はそれ以外の文字も含まれる可能性があります。
   */
  get userName(): string | null {
    return this.userClass.username;
  }

  /**
   * ユーザーの表示名を取得します。
   * @returns ユーザーの表示名。旧式のユーザー名の場合はユーザー名と同じです。
   */
  get displayName(): string {
    return this.userClass.displayName;
  }

  /**
   * ユーザーのglobal名を取得します。
   * @returns ユーザーのglobal名。botには設定されていないためnullです。
   * @deprecated 代わりにgetDisplayNameを使用してください。
   */
  get globalName(): string | null {
    return this.userClass.globalName;
  }
}

/**
 * Userクラスのラッパークラスです。
 */
class UserWrapper extends PartialUserWrapper {
  readonly userClass: User;

  /**
   * constructor
   * @param user discord.jsのUserクラス
   */
  constructor(user: User) {
    super(user);
    this.userClass = user;
  }

  /**
   * インスタンスを作成します。
   * @param user discord.jsのUserクラス
   * @returns UserWrapperのインスタンス
   */
  static create(user: User | PartialUser): UserWrapper | PartialUserWrapper {
    if (user.partial) {
      return new PartialUserWrapper(user);
    }
    return new UserWrapper(user);
  }

  /**
   * PartialUserかどうかを取得します。
   * @returns PartialUserかどうか
   */
  get partial() {
    return this.userClass.partial;
  }

  /**
   * PartialUserでないことを検証します。
   * @returns PartialUserでないこと
   */
  isNotPartial(): this is UserWrapper {
    return !this.partial;
  }

  /**
   * ユーザー名を取得します。
   * @returns ユーザー名。英数字とピリオド、アンダースコアのみで構成されますが、旧式のユーザー名の場合はそれ以外の文字も含まれる可能性があります。
   */
  get userName(): string {
    return this.userClass.username;
  }
}

/**
 * GuildMemberクラスのラッパークラスです。
 */
class GuildMemberUserWrapper extends UserWrapper {
  readonly guildMemberUserClass: GuildMember;

  /**
   * constructor
   * @param guildMemberUser discord.jsのGuildMemberクラス
   */
  constructor(guildMemberUser: GuildMember) {
    super(guildMemberUser.user);
    this.guildMemberUserClass = guildMemberUser;
  }

  /**
   * ユーザーのニックネームを取得します。
   * @returns ユーザーのニックネーム。設定されていない場合はnullです。
   */
  get nickname(): string | null {
    return this.guildMemberUserClass.nickname;
  }

  /**
   * ギルド上で表示されているユーザー名を取得します。
   * @returns ギルド上で表示されているユーザー名。ニックネームが設定されている場合はニックネーム、設定されていない場合はユーザー名です。
   */
  get guildDisplayName(): string {
    const { nickname } = this;
    return nickname !== null ? nickname : this.displayName;
  }

  /**
   * ロールのキャッシュを取得します。
   * @returns ロールの配列
   */
  get roles() {
    return this.guildMemberUserClass.roles.cache;
  }

  /**
   * ロールを追加します。
   * @param role ロール
   * @param reason 追加理由
   */
  addRoles = async (role: RoleResolvable | readonly RoleResolvable[], reason?: string) => {
    await this.guildMemberUserClass.roles.add(role, reason);
  };

  /**
   * ロールを削除します。
   * @param role ロール
   * @param reason 削除理由
   */
  removeRoles = async (role: RoleResolvable | readonly RoleResolvable[], reason?: string) => {
    await this.guildMemberUserClass.roles.remove(role, reason);
  };

  /**
   * ロールを設定します。
   * @param role ロール
   * @param reason 設定理由
   */
  setRoles = async (role: readonly RoleResolvable[], reason?: string) => {
    await this.guildMemberUserClass.roles.set(role, reason);
  };

  /**
   * ユーザーをタイムアウトさせます。
   * @param time タイムアウト時間。ミリ秒。nullの場合は解除。
   * @param reason タイムアウト理由
   */
  timeout = async (time: number | null, reason?: string) => {
    await this.guildMemberUserClass.timeout(time, reason);
  };
}

export { GuildMemberUserWrapper, PartialUserWrapper, UserWrapper };
