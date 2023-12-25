import { assert } from "console";
import { Lexer } from "./lexer";
import { readdirSync } from "fs";

// TODO, setup testing properly
// for now we just print the tokens

export let tests_run = (specific?: string) => {
  if (specific != undefined) {
    let lexer = new Lexer(specific);
    lexer.lex();
    for (let token of lexer.tokens) token.log();
    return;
  }

  let files = readdirSync("./tests/");

  files.forEach(file => {
    console.log(`*** TESTING: ${file} ***`);
    let lexer = new Lexer(`./tests/${file}`);
    lexer.lex();
    for (let token of lexer.tokens) token.log();
  });
};
