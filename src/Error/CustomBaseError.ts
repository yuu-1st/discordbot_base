export type customErrorType = 'Runtime' | 'Logical' | 'Wrapped' | 'Unknown';

/*
 * エラーコード
 * 1000 : Logical Error
 * 2000 : Runtime Error
 */

export default abstract class CustomBaseError extends Error {
  private errorCode: number;

  protected errorType: customErrorType;

  constructor(errorCode: number, errorType: customErrorType, message: string) {
    super();
    this.errorCode = errorCode;
    this.errorType = errorType;
    this.message = message;
  }

  /**
   * エラーメッセージをstringで取得します
   * @returns
   */
  stringErrorMessage = (): string => {
    const { errorCode } = this;
    const errorType = this.constructor.name;
    const errorMessage = this.message;

    const message = `${errorType} (${errorCode}): ${errorMessage}`;

    return message;
  };
}
