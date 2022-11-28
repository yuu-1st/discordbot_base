import { AutocompleteInteraction } from 'discord.js';
import { UnexpectedValueRuntimeError } from '../../Error/RuntimeError.js';
import InteractionWrapper from './interactionWrapper.js';

/**
 * オートコンプリートのInteractionのラッパークラスです。
 */
export class AutoCompleteInteractionWrapper extends InteractionWrapper {
  protected interaction: AutocompleteInteraction;

  /**
   * コンストラクタ
   * @param interaction AutocompleteInteraction
   */
  constructor(interaction: AutocompleteInteraction) {
    super(interaction);
    this.interaction = interaction;
  }

  /**
   * Discordに選択肢を送信します
   * @param options 選択肢。上限は25個です。
   */
  sendOptions = async (options: { name: string; value: string }[]) => {
    if (options.length > 25) {
      throw new UnexpectedValueRuntimeError('optionsの個数', String(options.length), 'under 25');
    }
    await this.interaction.respond(options);
  };

  /**
   * @returns フォーカスされているオプションを取得します
   */
  getFocusedOption = () => this.interaction.options.getFocused(true);

  /**
   * @returns フォーカスされているオプションの名前を取得します
   */
  getFocusedOptionName = () => this.getFocusedOption().name;

  /**
   * @returns フォーカスされているオプションの現在の入力値を取得します
   */
  getFocusedOptionValue = () => this.getFocusedOption().value;

  /**
   * @returns フォーカスされているオプションの種類(string | number | integer)を取得します
   */
  getFocusedOptionType = () => this.getFocusedOption().type;

  /**
   * 他のオプションの値を取得します
   * @param name 取得するオプションの名前
   * @returns オプションの値。string | number | boolean | snowflake | null
   */
  getOtherOptionValue = (name: string) => this.interaction.options.get(name)?.value;

  /**
   * 他のオプションの値(string)を取得します
   * @param name 取得するオプションの名前
   * @returns オプションの値。string | null
   */
  getOtherOptionStringValue = (name: string) => this.interaction.options.getString(name);

  /**
   * 他のオプションの値(number)を取得します
   * @param name 取得するオプションの名前
   * @returns オプションの値。number | null
   */
  getOtherOptionNumberValue = (name: string) => this.interaction.options.getNumber(name);

  /**
   * 他のオプションの値(integer)を取得します
   * @param name 取得するオプションの名前
   * @returns オプションの値。number | null
   */
  getOtherOptionIntegerValue = (name: string) => this.interaction.options.getInteger(name);

  /**
   * 他のオプションの値(boolean)を取得します
   * @param name 取得するオプションの名前
   * @returns オプションの値。boolean | null
   */
  getOtherOptionBooleanValue = (name: string) => this.interaction.options.getBoolean(name);

  /**
   * サブコマンドを使用している場合はサブコマンド名を取得します
   * @returns サブコマンド名。string | null
   * @throws TypeError [CommandInteractionOptionNoSubcommand]以外のエラーが発生した場合
   */
  getSubCommandName = () => {
    try {
      return this.interaction.options.getSubcommand();
    } catch (e) {
      if (e instanceof TypeError) {
        // TypeError [CommandInteractionOptionNoSubcommand]
        if (e.name.includes('CommandInteractionOptionNoSubcommand')) {
          return null;
        }
      }
      throw e;
    }
  };
}

export default AutoCompleteInteractionWrapper;
