/**
 * オブジェクトの特定の要素を必須にします。
 */
export type PartialRequire<O, K extends keyof O> = {
  [P in K]-?: O[P];
} & O;

/**
 * オブジェクトの特定の要素をオプショナルにします。
 */
export type ImpartialRequire<O, K extends keyof O> = {
  [P in keyof Omit<O, K>]-?: O[P];
} & O;
