import Command from '../command.js'

export default class BrainfuckCommand extends Command {
    name = 'javascript';
    desc = 'execute javascript';
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
