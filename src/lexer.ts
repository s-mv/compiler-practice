import { readFileSync } from "fs";
import { Token, TokenType } from "./token";

const single_char_operators = "{}[]()+-*/.,;!=><";
const double_char_operators = ["==", "++", "--", "<<", ">>"];

const keywords = [
  "auto", "break", "case", "char", "const", "continue", "default", "do",
  "double", "else", "enum", "extern", "float", "for", "goto", "if", "int",
  "long", "register", "return", "short", "signed", "sizeof", "static",
  "struct", "switch", "typedef", "union", "unsigned", "void", "volatile",
  "while",
];

export class Lexer {
  private input: string;
  private file_path: string;
  public tokens: Token[];

  private index: number = 0;
  // private last_index: number = 0; // TODO: implement everywhere

  private loc = {
    line: 1,
    column: 1,
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
      this.lex_operators();
      this.lex_numbers();
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
      if (this.index == -1) this.index = this.input.length; // if it's EOF not \n
      else this.index--; // \n shouldn't be considered part of the comment

      let comment = this.input.substring(index_beginning, this.index + 1);
      token = new Token(TokenType.COMMENT, comment);
    }

    if (this.current == "/" && this.peek == "*") {
      let index = this.input.indexOf("*/", this.index + 2);
      let next_index = this.input.indexOf("/*", this.index + 2);
      if (index == -1 || (next_index != -1 && index > next_index)) {
        this.index += 2;

        token = new Token(
          TokenType.ERROR,
          `At (${this.file_path}:${this.loc.line}:${this.loc.column}): ` +
          "Incomplete multi-line comment."
        );
      } else {
        let comment = this.input.substring(index_beginning, index);
        this.index = index + 2;

        token = new Token(TokenType.COMMENT, comment);
      }
    }

    this.update_loc_recursive(index_beginning, this.index);

    if (token.type != TokenType.NONE) this.tokens.push(token);
  };

  private lex_numbers = () => {
    let dot_count = 0;
    let token: Token = new Token();

    enum Radix { BIN = 2, OCT = 8, DEC = 10, HEX = 16, };

    let radix = Radix.DEC;

    // if it isn't a decimal or doesn't have a 0, return
    if ("0" > this.current && this.current > "9") return;

    // binary numbers
    if (this.current == "0" && this.peek.toLowerCase() == "b") {
      radix = Radix.BIN;
      this.index += 2;
    }
    // hexadecimal numbers
    if (this.current == "0" && this.peek.toLowerCase() == "x") {
      radix = Radix.HEX;
      this.index += 2;
    }
    // octal numbers (later because only 0)
    if (this.current == "0" && radix == Radix.DEC) {
      radix = Radix.OCT;
      this.index++;
    }

    let index = this.index;

    for (; index < this.input.length; index++) {
      let c = this.input[index];
      // later update this to include symbols
      if (" \t\n".includes(this.input[index + 1]) || index + 1 == this.input.length) {
        let num = this.input.substring(this.index, index + 1);

        if (num.length == 0) break;

        if (radix == Radix.BIN && /[^0-1]/gi.test(num)) {
          token = new Token(TokenType.ERROR,
            `At (${this.file_path}:${this.loc.line}:${this.loc.column}): ` +
            `Invalid binary number: ${num}.`
          );
          break;
        }

        if (radix == Radix.OCT && /[^0-7]/gi.test(num)) {
          token = new Token(TokenType.ERROR,
            `At (${this.file_path}:${this.loc.line}:${this.loc.column}): ` +
            `Invalid octal number: ${num}.`
          );
          break;
        }

        if (radix == Radix.HEX && /[^0-9a-f]/gi.test(num)) {
          token = new Token(TokenType.ERROR,
            `At (${this.file_path}:${this.loc.line}:${this.loc.column}): ` +
            `Invalid hexadecimal number: ${num}.`
          );
          break;
        }

        if (dot_count == 1) token = new Token(TokenType.FLOATING, parseFloat(num));
        else token = new Token(TokenType.INTEGER, parseInt(num, radix));

        break;
      }

      // non-decimal numbers cannot be float
      if (c == ".") {
        if (radix != Radix.DEC) {
          token = new Token(TokenType.ERROR,
            `At (${this.file_path}:${this.loc.line}:${this.loc.column}): ` +
            "Only decimal numbers can have a floating point."
          );
          break;
        }

        if (dot_count == 1) {
          token = new Token(TokenType.ERROR,
            `At (${this.file_path}:${this.loc.line}:${this.loc.column}): ` +
            "Unexpected floating point at the end of floating point."
          );
          break;
        }

        dot_count++;
        continue;
      }
    }

    this.update_loc_recursive(this.index, index);
    this.index = index;

    if (token.type != TokenType.NONE) this.tokens.push(token);
  };

  private lex_operators = () => {
    // first check for two character operators
    if (double_char_operators.includes(this.current + this.peek)) {
      let token = new Token(TokenType.OPERATOR, this.current + this.peek);
      this.tokens.push(token);

      this.update_loc(); // defaults to current
      this.update_loc(this.peek);
      this.index += 2;
      return;
    }

    // now check for single character operators
    // this way we don't have to care if the next character is a symbol
    if (single_char_operators.includes(this.current)) {
      let token = new Token(TokenType.OPERATOR, this.current);
      this.tokens.push(token);

      this.update_loc();
      this.index++;
      return;
    }
  };

  private lex_identifiers = () => {

  };

  private line_advance = () => {
    this.loc.column = 1;
    this.loc.line++;
  };

  private column_advance = () => { this.loc.column++; };

  private skip = () => { return ++this.index; };

  private update_loc = (current = this.current) => {
    if (current == "\n") this.line_advance();
    else this.column_advance();
  };

  private update_loc_recursive = (start: number, end: number) => {
    for (let i = start; i <= end; i++) this.update_loc(this.input[i]);
  };

  private set location({ line, column }: { line: number, column: number; }) {
    this.loc.line = line;
    this.loc.column = column;
  }

  private get current() { return this.input[this.index]; }
  private get peek() { return this.input[this.index + 1]; }
  private get next() { return this.input[this.index++]; }
  private get pop() { return this.input[--this.index]; }

}