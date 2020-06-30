import Command from '../command.js'

export default class EchoCommand extends Command {
    name = 'echo';
    synopsis = `${process.env.PREFIX}echo [string]...`;
    examples = `${process.env.PREFIX}echo foo`;
    desc = 'echo the string(s) to standard output';
    /**
     * @param {any} client client
     * @param {any} message message
     * @param {array} command command
     * @param {string} stdin stdin
     * @return {string} result
     */
    exec(client, message, command, stdin) {
        return command.slice(2).map(c => c.content).join(' ');
    }
};
