import Command from '../command.js'

export default class Base64Command extends Command {
    name = 'base64';
    synopsis = `${process.env.PREFIX}base64 [options]... [text]`;
    examples = `${process.env.PREFIX}base64 --encode abc`;
    desc = `execute brainfuck

**CODE**
code will be parsed with \`brainfuck-node\``;
    /**
     * @param {any} client client
     * @param {any} message message
     * @param {array} command command
     * @param {string} stdin stdin
     * @return {string} result
     */
    exec(client, message, command, stdin) {
        const source = stdin.length > 0 ? stdin : command[2].content;

        const brainFuck = new Brainfuck();

        const result = brainFuck.execute(source);

        return result.output;
    }
};
