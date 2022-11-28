import { ChatInputCommandInteraction } from 'discord.js';
import { MessageAbleInteractionWrapper } from './MessageAbleInteractionWrapper.js';

/**
 * チャット入力コマンドのInteractionのラッパークラスです。
 */
export class ChatInputCommandInteractionWrapper extends MessageAbleInteractionWrapper {
  protected interaction: ChatInputCommandInteraction;

  /**
   * コンストラクタ
   * @param interaction ChatInputCommandInteraction
   * @param isClosed 返信を非公開にするかどうか
   */
  constructor(interaction: ChatInputCommandInteraction, isClosed = true) {
    super(interaction, isClosed);
    this.interaction = interaction;
  }

  /**
   * 引数を取得します
   */
  getArgs = {
    /**
     * Attachmentを取得します(引数必須)
     * @param name 名前
     * @returns Boolean
     */
    AttachmentRequired: (name: string) => this.interaction.options.getAttachment(name, true),

    /**
     * Attachmentを取得します(引数任意)
     * @param name 名前
     * @returns Boolean
     */
    Attachment: (name: string) => this.interaction.options.getAttachment(name, false),

    /**
     * Booleanを取得します(引数必須)
     * @param name 名前
     * @returns Boolean
     */
    BooleanRequired: (name: string) => this.interaction.options.getBoolean(name, true),

    /**
     * Booleanを取得します(引数任意)
     * @param name 名前
     * @returns Boolean
     */
    Boolean: (name: string) => this.interaction.options.getBoolean(name, false),

    /**
     * Channelを取得します(引数必須)
     * @param name 名前
     * @returns Channel
     */
    ChannelRequired: (name: string) => this.interaction.options.getChannel(name, true),

    /**
     * Channelを取得します(引数任意)
     * @param name 名前
     * @returns Channel
     */
    Channel: (name: string) => this.interaction.options.getChannel(name, false),

    /**
     * Integerを取得します(引数必須)
     * @param name 名前
     * @returns Integer
     */
    IntegerRequired: (name: string) => this.interaction.options.getInteger(name, true),

    /**
     * Integerを取得します(引数任意)
     * @param name 名前
     * @returns Integer
     */
    Integer: (name: string) => this.interaction.options.getInteger(name, false),

    /**
     * getMentionableを取得します(引数必須)
     * @param name 名前
     * @returns Emoji
     */
    MentionableRequired: (name: string) => this.interaction.options.getMentionable(name, true),

    /**
     * getMentionableを取得します(引数任意)
     * @param name 名前
     * @returns Emoji
     */
    Mentionable: (name: string) => this.interaction.options.getMentionable(name, false),

    /**
     * Numberを取得します(引数必須)
     * @param name 名前
     * @returns Number
     */
    NumberRequired: (name: string) => this.interaction.options.getNumber(name, true),

    /**
     * Numberを取得します(引数任意)
     * @param name 名前
     * @returns Number
     */
    Number: (name: string) => this.interaction.options.getNumber(name, false),

    /**
     * Roleを取得します(引数必須)
     * @param name 名前
     * @returns Role
     */
    RoleRequired: (name: string) => this.interaction.options.getRole(name, true),

    /**
     * Roleを取得します(引数任意)
     * @param name 名前
     * @returns Role
     */
    Role: (name: string) => this.interaction.options.getRole(name, false),

    /**
     * Stringを取得します(引数必須)
     * @param name 名前
     * @returns String
     */
    StringRequired: (name: string) => this.interaction.options.getString(name, true),

    /**
     * Stringを取得します(引数任意)
     * @param name 名前
     * @returns String
     */
    String: (name: string) => this.interaction.options.getString(name, false),

    /**
     * Userを取得します(引数必須)
     * @param name 名前
     * @returns User
     */
    UserRequired: (name: string) => this.interaction.options.getUser(name, true),

    /**
     * Userを取得します(引数任意)
     * @param name 名前
     * @returns User
     */
    User: (name: string) => this.interaction.options.getUser(name, false),

    /**
     * Subcommandを取得します(引数必須)
     * @returns Subcommand
     */
    SubcommandRequired: () => this.interaction.options.getSubcommand(true),

    /**
     * Subcommandを取得します(引数任意)
     * @returns Subcommand
     */
    Subcommand: () => this.interaction.options.getSubcommand(false),

    /**
     * SubcommandGroupを取得します(引数必須)
     * @returns SubcommandGroup
     */
    SubcommandGroupRequired: () => this.interaction.options.getSubcommandGroup(true),

    /**
     * SubcommandGroupを取得します(引数任意)
     * @returns SubcommandGroup
     */
    SubcommandGroup: () => this.interaction.options.getSubcommandGroup(false),
  };
}

export default ChatInputCommandInteractionWrapper;
