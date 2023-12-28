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

  log = (verbose: boolean = false) => {
    switch (this.type) {
      case TokenType.INTEGER:
        console.log(`INT LITERAL: <${this.value}>`);
        break;
      case TokenType.FLOATING:
        console.log(`FLOAT LITERAL: <${this.value}>`);
        break;
    }

    if (!verbose) return;

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

      // non-verbose tokens just break
      case TokenType.INTEGER:
      case TokenType.FLOATING:
        break;

      default:
        console.log(`UNDOCUMENTED (${this.type}): <${this.value}>`);
        break;
    }
  };
}