import Command from '../command.js'

export default class JavascriptCommand extends Command {
    name = 'javascript';
    synopsis = `${process.env.PREFIX}javascript [code]`;
    examples = `*${process.env.PREFIX}javascript '1 + 1'*\nexecute javascript`;
    desc = `execute javascript (eval). print last expression.`;
    seeAlso = '[JavaScript | MDN](https://developer.mozilla.org/ja/docs/Web/JavaScript)';
    /**
     * @param {any} client client
     * @param {any} message message
     * @param {array} command command
     * @param {string} stdin stdin
     * @return {string} result
     */
    exec(client, message, command, stdin) {
        const source = stdin.length > 0 ? stdin : command[2].content;

        const result = (null, eval)(source);

        return result;
    }
};
