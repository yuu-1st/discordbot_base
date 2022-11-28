import { Snowflake, SnowflakeUtil, VoiceState } from 'discord.js';

type StateListType = keyof Pick<
  VoiceState,
  | 'serverDeaf'
  | 'serverMute'
  | 'selfDeaf'
  | 'selfMute'
  | 'selfVideo'
  | 'streaming'
  | 'channelId'
  | 'sessionId'
  | 'suppress'
  | 'requestToSpeakTimestamp'
>;

/**
 * VoiceStateUpdateイベントのラッパークラスです。
 */
class VoiceStateUpdateWrapper {
  private snowflake: Snowflake;

  /**
   * コンストラクタ
   * @param oldState oldState
   * @param newState newState
   */
  constructor(readonly oldState: VoiceState, readonly newState: VoiceState) {
    this.snowflake = String(SnowflakeUtil.generate());
  }

  /** @returns snowflakeID。実際のイベントではIDが発行されないため、当クラスが勝手に生成した値。 */
  get originalSnowflakeId() {
    return this.snowflake;
  }

  /**
   * guildIdを取得します
   * @returns guildId
   */
  get guildId() {
    return this.newState.guild.id;
  }

  /** @returns stateのターゲットメンバー */
  get userId() {
    return this.newState.id;
  }

  private getStateValue = <T extends StateListType>(
    oldNew: 'old' | 'new',
    state: T,
  ): VoiceState[T] => {
    if (oldNew === 'old') {
      return this.oldState[state];
    }
    return this.newState[state];
  };

  private getState = <T extends StateListType>(
    state: T,
  ): {
    isUpdate: boolean;
    oldState: VoiceState[T];
    newState: VoiceState[T];
  } => {
    const oldState = this.getStateValue('old', state);
    const newState = this.getStateValue('new', state);
    const isUpdate = (() => {
      if (oldState === newState) {
        return false;
      }
      return true;
    })();
    return { isUpdate, oldState, newState };
  };

  /** @returns サーバー側でスピーカーミュートに設定されているか */
  getServerDeafState = () => this.getState('serverDeaf');

  /** @returns サーバー側でマイクミュートに設定されているか */
  getServerMuteState = () => this.getState('serverMute');

  /** @returns メンバー自身でスピーカーミュートに設定されているか */
  getSelfDeafState = () => this.getState('selfDeaf');

  /** @returns メンバー自身でマイクミュートに設定されているか */
  getSelfMuteState = () => this.getState('selfMute');

  /** @returns メンバー自身でカメラ配信を行っているか */
  getSelfVideoState = () => this.getState('selfVideo');

  /** @returns メンバー自身でライブ配信を行っているか */
  getStreamingState = () => this.getState('streaming');

  /** @returns メンバーが参加しているボイスチャットのId */
  getChannelIdState = () => this.getState('channelId');

  /** @returns メンバーのセッションId */
  getSessionIdState = () => this.getState('sessionId');

  /** @returns メンバーの発言内容が禁止されているか(ステージチャンネル専用) */
  getSuppressState = () => this.getState('suppress');

  /** @returns メンバーの発言リクエストを申請した時刻(ステージチャンネル専用) */
  getRequestToSpeakTimestampState = () => this.getState('requestToSpeakTimestamp');

  /**
   * メンバーがボイスチャンネルに参加した時のイベントか
   * @param includeChange ボイスチャンネルを変更した時を含むか。デフォルトはfalse
   * @returns 参加した時：参加先のチャンネルId、参加していない時：false
   */
  isVoiceChannelJoined = (includeChange: boolean = false) => {
    const state = this.getChannelIdState();
    if (state.isUpdate === true && state.newState !== null) {
      if (state.oldState === null) {
        return state.newState;
      }
      if (includeChange) {
        return state.newState;
      }
    }
    return false;
  };

  /**
   * メンバーがボイスチャンネルから退室した時のイベントか
   * @param includeChange ボイスチャンネルを変更した時を含むか。デフォルトはfalse
   * @returns 退室した時：退室"元"のチャンネルId、退室していない時：false
   */
  isVoiceChannelLeft = (includeChange: boolean = false) => {
    const state = this.getChannelIdState();
    if (state.isUpdate === true && state.oldState !== null) {
      if (state.newState === null) {
        return state.oldState;
      }
      if (includeChange) {
        return state.oldState;
      }
    }
    return false;
  };

  /**
   * メンバーがボイスチャンネルを移動した時のイベントか
   * @returns 退室した時：退室元と参加先のチャンネルId、退室していない時：false
   */
  isVoiceChannelChange = () => {
    const state = this.getChannelIdState();
    if (state.isUpdate === true && state.oldState !== null && state.newState !== null) {
      return {
        beforeChannelId: state.oldState,
        afterChannelId: state.newState,
      };
    }
    return false;
  };
}

export default VoiceStateUpdateWrapper;
