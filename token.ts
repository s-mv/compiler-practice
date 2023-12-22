export enum TokenType {
  NONE,
  IDENTIFIER,  // TODO
  OPERATOR,    // TODO
  SYMBOL,      // TODO
  KEYWORD,     // TODO
  INTEGER,     // TODO
  FLOATING,    // TODO
  STRING,      // TODO
  COMMENT,     // mostly a helper TODO
  NEWLINE,     // mostly a helper TODO
}

export class Token {
  type: TokenType;
  value: number | string;

  constructor() {
    this.type = TokenType.NONE;
    this.value = NaN;
  }
}