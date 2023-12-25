export enum TokenType {
  NONE,
  IDENTIFIER,  // TODO
  OPERATOR,    // TODO
  SYMBOL,      // TODO
  KEYWORD,     // TODO
  INTEGER,     // TODO
  FLOATING,    // TODO
  STRING,      // TODO
  COMMENT,
  WHITESPACE,
  ERROR,
  FILE,        // this token keeps track of the current file 
}

export class Token {
  type: TokenType;
  value: number | string;

  constructor(type: TokenType = TokenType.NONE, value: number | string = NaN) {
    this.type = type;
    this.value = value;
  }

  log = () => {
    switch (this.type) {
      case TokenType.FILE:
        console.log(`FILE: ${this.value}`);
        break;
      case TokenType.WHITESPACE:
        console.log(`WHITESPACE: <${this.value}>`);
        break;
      case TokenType.COMMENT:
        console.log(`COMMENT: <${this.value}>`);
        break;
      case TokenType.ERROR:
        console.log(`ERROR: ${this.value}`);
        break;
      default:
        console.log(`UNDOCUMENTED (${this.type}): <${this.value}>`);
        break;
    }
  };
}