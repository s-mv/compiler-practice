import { readFileSync } from "fs";
import { Token, TokenType } from "./token";

export class Lexer {
  private input: string;
  private file_path: string;
  public tokens: Token[];

  private index: number = 0;

  private loc = {
    line: 1,
    column: 1,
    line_last: 1,
    column_last: 1,
  };

  constructor(file_path: string) {
    this.file_path = file_path;
    this.input = readFileSync(file_path, "utf-8");
    this.tokens = [new Token(TokenType.FILE, file_path)];
  };

  public lex = () => {
    for (this.index = 0; this.index < this.input.length; this.skip()) {
      this.lex_whitespace();
      this.lex_comments();
      this.lex_numbers();
      this.lex_symbols();
      this.lex_identifiers();
    }
  };

  private lex_whitespace = () => {
    let index_beginning = this.index;
    while (this.index < this.input.length) {
      let c = this.current;
      if (" \t".includes(c)) this.column_advance();
      else if (c == "\n") this.line_advance();
      else break;
      this.next;
    }

    let index_ending = this.index;


    if (index_beginning == index_ending) return;

    let whitespace = this.input.substring(index_beginning, index_ending);
    let token = new Token(TokenType.WHITESPACE, whitespace);

    this.tokens.push(token);
  };

  // I wish I could nest a bit less here
  private lex_comments = () => {
    let token = new Token();

    let index_beginning = this.index + 2;

    if (this.current == "/" && this.peek == "/") {
      this.index = this.input.indexOf("\n", this.index + 2);
      if (this.index == -1) this.index = this.input.length - 1; // if it's EOF not \n
      else this.index--; // \n shouldn't be considered part of the comment

      let comment = this.input.substring(index_beginning, this.index + 1);
      token = new Token(TokenType.COMMENT, comment);
    }

    if (this.current == "/" && this.peek == "*") {
      let index = this.input.indexOf("*/", this.index + 2);
      let next_index = this.input.indexOf("/*", this.index + 2);
      if (index == -1 || next_index == -1 || index > next_index) {
        this.index += 2;

        token = new Token(
          TokenType.ERROR,
          `Incomplete multi-line comment starting at (${this.file_path}:${this.loc.line}:${this.loc.column}).`
        );
      } else {
        let comment = this.input.substring(index_beginning, index);
        this.index = index + 2;

        token = new Token(TokenType.COMMENT, comment);
      }
    }


    for (let i = index_beginning; i <= this.index; i++) {
      if (this.input[i] == "\n") this.line_advance();
      else this.column_advance();
    }

    if (token.type != TokenType.NONE) this.tokens.push(token);
  };

  private lex_numbers = () => {

  };
  private lex_symbols = () => {

  };

  private lex_identifiers = () => {

  };

  private line_advance = () => {
    this.loc.line_last = this.loc.line;
    this.loc.column_last = this.loc.column;
    this.loc.column = 1;
    this.loc.line++;
  };

  private column_advance = () => {
    this.loc.column_last = this.loc.column;
    this.loc.column++;
  };

  private skip = () => { return ++this.index; };

  private set location({ line, column }: { line: number, column: number; }) {
    this.loc.line_last = this.loc.line;
    this.loc.column_last = this.loc.line;
    this.loc.line = line;
    this.loc.column = column;
  }


  private get current() { return this.input[this.index]; }
  private get peek() { return this.input[this.index + 1]; }
  private get next() { return this.input[this.index++]; }
  private get pop() { return this.input[--this.index]; }

}