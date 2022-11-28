import { UnexpectedValueRuntimeError } from '../Error/RuntimeError.js';

/**
 * 配列をランダムに並び替えます
 * @param array 並び替える配列
 * @returns 並び替えた後
 */
export function shuffleArray<T>(array: T[]): T[] {
  // 参考：https://www.nxworld.net/js-array-shuffle.html
  const returnArray = [...array];
  for (let i = returnArray.length - 1; i >= 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [returnArray[i], returnArray[j]] = [returnArray[j], returnArray[i]];
  }
  return returnArray;
}

/**
 * 配列の中からランダムで一つを返します
 * @param array 配列
 * @returns ランダム要素
 */
export function randomArray<T>(array: T[]): T {
  return shuffleArray(array)[0];
}

/**
 * 指定時間待ちます
 * @param ms 時間ミリ秒
 * @returns Promise<void>
 */
export function sleep(ms: number): Promise<void> {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 1d1h1m1sのような文字列をミリ秒に変換します
 * @param timeString 1d1h1m1sのような文字列
 * @returns ミリ秒
 * @throws UnexpectedValueRuntimeError 想定外の文字列が渡されたとき
 */
export function timeStringToMs(timeString: string): number {
  const timeStringArray = timeString.split(/(\d+)/).filter((v) => v !== '');
  let timeMs = 0;
  for (let i = 0; i < timeStringArray.length; i += 2) {
    const time = Number(timeStringArray[i]);
    const unit = timeStringArray[i + 1];
    switch (unit) {
      case 'd':
        timeMs += time * 24 * 60 * 60 * 1000;
        break;
      case 'h':
        timeMs += time * 60 * 60 * 1000;
        break;
      case 'm':
        timeMs += time * 60 * 1000;
        break;
      case 's':
        timeMs += time * 1000;
        break;
      default:
        throw new UnexpectedValueRuntimeError('timeString', timeString, '1d1h1m1sのような文字列');
    }
  }
  return timeMs;
}

export type dateStringToDayjsReturnType = [
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
];
/**
 * 文字列から日付を取得します。
 *
 * 文字区切り対象文字列 = / | - | : | 空白 | それぞれの漢字
 * @param dateString 日付文字列
 * @returns 日付[年, 月, 日, 時, 分, 秒]取得できなかったヶ所はnull
 * @example
 * dateStringToDate('2022-01-01') => [2022, 1, 1, null, null, null]
 * dateStringToDate('01-01') => [null, 1, 1, null, null, null]
 * dateStringToDate('12/12 12:12:12') => [null, 12, 12, 12, 12, 12]
 * dateStringToDate('2022年01月01日') => [2022, 1, 1, null, null, null]
 * dateStringToDate('12-12 12:12') => [null, 12, 12, 12, 12, null]
 * dateStringToDate('12-') => [null, 12, null, null, null, null]
 * dateStringToDate('13-11') => [13, 11, null, null, null, null]
 * dateStringToDate('13-13') => [13, 13, null, null, null, null]
 */
export function dateStringToDayjs(
  dateString: string,
): dateStringToDayjsReturnType {
  const returnArray: dateStringToDayjsReturnType = [null, null, null, null, null, null];
  const dateArray = dateString.split(/([-/:|年月日時分秒\s])/).filter((v) => v !== '');
  for (let i = 0; i < dateArray.length; i += 2) {
    const date = Number(dateArray[i]);
    const unit = dateArray[i + 1];
    switch (unit) {
      case '年':
        returnArray[0] = date;
        break;
      case '月':
        returnArray[1] = date;
        break;
      case '日':
        returnArray[2] = date;
        break;
      case '時':
        returnArray[3] = date;
        break;
      case '分':
        returnArray[4] = date;
        break;
      case '秒':
        returnArray[5] = date;
        break;
      case '-':
      case '/': {
        // '-'と'/'は同じ扱い。
        // ここより前に何個含まれていたか取得する
        const countBefore = dateArray.slice(0, i).filter((v) => v === unit).length;
        const countAfter = dateArray.slice(i).filter((v) => v === unit).length;
        if (countBefore === 0) {
          // countAfterが2の場合は年。それ以外の場合はdateが12以下なら月、それ以上は年
          if (countAfter === 2) {
            returnArray[0] = date;
          } else if (date <= 12) {
            returnArray[1] = date;
          } else {
            returnArray[0] = date;
          }
        } else if (countBefore === 1) {
          // countAfterが1の場合は月。それ以外の場合は年がnullなら日、それ以外は月
          if (countAfter === 1) {
            returnArray[1] = date;
          } else if (returnArray[0] === null) {
            returnArray[2] = date;
          } else {
            returnArray[1] = date;
          }
        }
        break;
      }
      case ':': {
        // ':'は時間か分か秒。何個含まれるか取得する
        const count = dateArray.filter((v) => v === unit).length;
        if (count === 1) {
          // 1つしかない場合は時間か分
          if (returnArray[3] === null) {
            returnArray[3] = date;
          } else if (returnArray[4] === null) {
            returnArray[4] = date;
          }
        } else if (count === 2) {
          // 2つある場合は時間か分か秒
          if (returnArray[3] === null) {
            returnArray[3] = date;
          } else if (returnArray[4] === null) {
            returnArray[4] = date;
          } else if (returnArray[5] === null) {
            returnArray[5] = date;
          }
        }
        break;
      }
      default:
        // 1つ前の要素で条件分岐
        if (dateArray[i - 1] === '-' || dateArray[i - 1] === '/') {
          // '-'か'/の前は日
          if (returnArray[0] === null) {
            returnArray[2] = date;
          } else if (returnArray[1] === null) {
            returnArray[1] = date;
          } else {
            returnArray[2] = date;
          }
        } else if (dateArray[i - 1] === ':') {
          // ':'の前は秒か分
          if (returnArray[4] === null) {
            returnArray[4] = date;
          } else if (returnArray[5] === null) {
            returnArray[5] = date;
          }
        }
        break;
    }
  }
  return returnArray;
}
