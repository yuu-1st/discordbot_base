interface tableInterface {
  [key: number]: {
    // experience = 100 * log2(x + 1) + x
    experience: number;
    // totalExperience =
    totalExperience: number;
  };
}

const tableMaxLevel = 500;

/**
 * レベル別経験値テーブル
 */
const table = (() => {
  const table2: tableInterface = {
    0: { experience: 1, totalExperience: 1 },
  };
  // 対数の氐
  const log = Math.log(16);
  // レベルに応じた必要経験値を計算する関数
  const levelFunc = (x: number, i: number): number => {
    if (x < 500) {
      return (Math.log(x + 1) / log / i) * 100;
    }
    return (Math.log(x + 1) / log / i) * 100 + levelFunc(x - 500, i + 1);
  };

  let { totalExperience } = table2[0];
  for (let i = 1; i <= tableMaxLevel; i += 1) {
    const experience = i * 0.2 + levelFunc(i, 1);
    totalExperience += experience;
    table2[i] = {
      experience: Math.floor(totalExperience - table2[i - 1].totalExperience),
      totalExperience: Math.floor(totalExperience),
    };
  }
  return table2;
})();

/**
 * 現在の経験値量を受け取り、現在のレベルを返す
 * @param experience 現在の経験値量
 * @returns 現在のレベル
 */
export function getLevel(experience: number): number {
  for (let i = 0; i < tableMaxLevel; i += 1) {
    if (experience < table[i].totalExperience) {
      return i;
    }
  }
  return tableMaxLevel;
}

/**
 * 現在の経験値量を受け取り、次のレベルまでに必要な経験値量を返す
 * @param experience 現在の経験値量
 * @returns 次のレベルまでに必要な経験値量
 */
export function getNextLevelExperience(experience: number): number {
  const level = getLevel(experience);
  if (level === tableMaxLevel) {
    return 0;
  }
  return table[getLevel(experience)].totalExperience - experience;
}

/**
 * レベルアップに必要な経験値量を返します。
 * @param level 取得したいレベル
 * @returns レベルアップに必要な経験値量
 */
export function getMaxExperience(level: number): number {
  if (level === tableMaxLevel) {
    return Number.MAX_SAFE_INTEGER;
  }
  if (level in table) {
    return table[level].experience;
  }
  return 0;
}
