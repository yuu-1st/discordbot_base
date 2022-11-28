// 参考サイト：https://note.affi-sapo-sv.com/js-diff.php

// const text1 = 'JavaScriptかJSか？';
// const text2 = 'JSはJavascriptのことか？';
export default function diffCount(text1: string, text2: string) {
  const [A, B] = text1.length < text2.length ? [text1, text2] : [text2, text1];
  const [M, N] = [A.length, B.length];
  const Δ = N - M;

  const { max } = Math;
  const snake = (k: number, v: number) => {
    let x = v - k;
    let y = v;
    while (x < M && y < N && A[x] === B[y]) {
      x += 1;
      y += 1;
    }
    return y;
  };

  const AlgorithmCompare = () => {
    const fp = [];
    for (let i = -(M + 1); i <= N + 1; i += 1) fp[i] = -1;
    let p = -1;

    do {
      p += 1;
      for (
        let k = -p;
        k <= Δ - 1;
        k += 1 // ループ１
      ) {
        fp[k] = snake(k, max(fp[k - 1] + 1, fp[k + 1]));
      }
      for (
        let k = Δ + p;
        k >= Δ + 1;
        k -= 1 // ループ２
      ) {
        fp[k] = snake(k, max(fp[k - 1] + 1, fp[k + 1]));
      }
      fp[Δ] = snake(Δ, max(fp[Δ - 1] + 1, fp[Δ + 1])); // Δの処理
    } while (fp[Δ] !== N);

    return Δ + 2 * p;
  };
  return AlgorithmCompare();
}
