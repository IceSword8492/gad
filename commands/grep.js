import Command from '../command.js'

export default class GrepCommand extends Command {
    name = 'grep';
    desc = 'grep';
    /**
     * @param {any} client client
     * @param {any} message message
     * @param {array} command command
     * @param {string} stdin stdin
     * @return {string} result
     */
    async exec(client, message, command, stdin) {console.log(command[2])
        const result = stdin.toString().split(/\n/g).filter(l => new RegExp(command[2] ? command[2].content : '', 'g').test(l));

        return result.join('\n');
    }
};
