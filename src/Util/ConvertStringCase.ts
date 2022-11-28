import { isIncludeConstObject } from './TypeGuard.js';

const kanaMap = {
  ｶﾞ: 'ガ',
  ｷﾞ: 'ギ',
  ｸﾞ: 'グ',
  ｹﾞ: 'ゲ',
  ｺﾞ: 'ゴ',
  ｻﾞ: 'ザ',
  ｼﾞ: 'ジ',
  ｽﾞ: 'ズ',
  ｾﾞ: 'ゼ',
  ｿﾞ: 'ゾ',
  ﾀﾞ: 'ダ',
  ﾁﾞ: 'ヂ',
  ﾂﾞ: 'ヅ',
  ﾃﾞ: 'デ',
  ﾄﾞ: 'ド',
  ﾊﾞ: 'バ',
  ﾋﾞ: 'ビ',
  ﾌﾞ: 'ブ',
  ﾍﾞ: 'ベ',
  ﾎﾞ: 'ボ',
  ﾊﾟ: 'パ',
  ﾋﾟ: 'ピ',
  ﾌﾟ: 'プ',
  ﾍﾟ: 'ペ',
  ﾎﾟ: 'ポ',
  ｳﾞ: 'ヴ',
  ﾜﾞ: 'ヷ',
  ｦﾞ: 'ヺ',
  ｱ: 'ア',
  ｲ: 'イ',
  ｳ: 'ウ',
  ｴ: 'エ',
  ｵ: 'オ',
  ｶ: 'カ',
  ｷ: 'キ',
  ｸ: 'ク',
  ｹ: 'ケ',
  ｺ: 'コ',
  ｻ: 'サ',
  ｼ: 'シ',
  ｽ: 'ス',
  ｾ: 'セ',
  ｿ: 'ソ',
  ﾀ: 'タ',
  ﾁ: 'チ',
  ﾂ: 'ツ',
  ﾃ: 'テ',
  ﾄ: 'ト',
  ﾅ: 'ナ',
  ﾆ: 'ニ',
  ﾇ: 'ヌ',
  ﾈ: 'ネ',
  ﾉ: 'ノ',
  ﾊ: 'ハ',
  ﾋ: 'ヒ',
  ﾌ: 'フ',
  ﾍ: 'ヘ',
  ﾎ: 'ホ',
  ﾏ: 'マ',
  ﾐ: 'ミ',
  ﾑ: 'ム',
  ﾒ: 'メ',
  ﾓ: 'モ',
  ﾔ: 'ヤ',
  ﾕ: 'ユ',
  ﾖ: 'ヨ',
  ﾗ: 'ラ',
  ﾘ: 'リ',
  ﾙ: 'ル',
  ﾚ: 'レ',
  ﾛ: 'ロ',
  ﾜ: 'ワ',
  ｦ: 'ヲ',
  ﾝ: 'ン',
  ｧ: 'ァ',
  ｨ: 'ィ',
  ｩ: 'ゥ',
  ｪ: 'ェ',
  ｫ: 'ォ',
  ｯ: 'ッ',
  ｬ: 'ャ',
  ｭ: 'ュ',
  ｮ: 'ョ',
  '｡': '。',
  '､': '、',
  ｰ: 'ー',
  '｢': '「',
  '｣': '」',
  '･': '・',
  ﾞ: '゛',
  ﾟ: '゜',
};

/**
 * 文字列をケバブケースに変換する
 * 例: convertToKebabCase('HelloWorld') => 'hello-world'
 * @param str 文字列
 * @returns ケバブケースに変換された文字列
 */
export function convertToKebabCase(str: string): string {
  return str.replace(/[A-Z]/g, (s) => `-${s.charAt(0).toLowerCase()}`).replace(/^-/, '');
}

/**
 * 文字列をスネークケースに変換する
 * 例: convertToSnakeCase('HelloWorld') => 'hello_world'
 * @param str 文字列
 * @returns スネークケースに変換された文字列
 */
export function convertToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (s) => `_${s.charAt(0).toLowerCase()}`).replace(/^_/, '');
}

/**
 * 半角カナを全角カナに変換する
 * 例: convertToFullWidthKana('ｶﾅ') => 'カナ'
 * @param str 文字列
 * @returns 全角カナに変換された文字列
 * @source https://qumeru.com/magazine/395
 */
export function convertToFullWidthKana(str: string): string {
  return str
    .split('')
    .map((s) => (isIncludeConstObject(kanaMap, s) ? kanaMap[s] : s))
    .join('');
}

/**
 * ひらがなをカタカナに変換する
 * 例: convertToKatakana('ひらがな') => 'ヒラガナ'
 * @param str 文字列
 * @returns カタカナに変換された文字列
 */
export function convertToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (s) => String.fromCharCode(s.charCodeAt(0) + 0x60));
}

/**
 * カタカナをひらがなに変換する
 * 例: convertToHiragana('カタカナ') => 'かたかな'
 * @param str 文字列
 * @returns ひらがなに変換された文字列
 */
export function convertToHiragana(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0x60));
}

/**
 * 半角英数字を全角英数字に変換する
 * 例: convertToFullWidthAlphanumeric('abc123') => 'ａｂｃ１２３'
 * @param str 文字列
 * @returns 全角英数字に変換された文字列
 */
export function convertToFullWidthAlphanumeric(str: string): string {
  return str.replace(/[A-Za-z0-9]/g, (s) => String.fromCharCode(s.charCodeAt(0) + 0xfee0));
}

/**
 * 全角英数字を半角英数字に変換する
 * 例: convertToHalfWidthAlphanumeric('ａｂｃ１２３') => 'abc123'
 * @param str 文字列
 * @returns 半角英数字に変換された文字列
 */
export function convertToHalfWidthAlphanumeric(str: string): string {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
}

/**
 * 半角英数字を全角英数字に変換する
 * 例: convertToFullWidthAlphabet('abc') => 'ａｂｃ'
 * @param str 文字列
 * @returns 全角英字に変換された文字列
 */
export function convertToFullWidthAlphabet(str: string): string {
  return str.replace(/[A-Za-z0-9]/g, (s) => String.fromCharCode(s.charCodeAt(0) + 0xfee0));
}
