import Command from '../command.js'

export default class GrepCommand extends Command {
    name = 'grep';
    synopsis = `${process.env.PREFIX}grep <pattern>`;
    examples = `*${process.env.PREFIX}echo foo | ${process.env.PREFIX}grep f*`;
    desc = `grep  searches for <pattern> in stdin. grep prints the matching lines.`;
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
