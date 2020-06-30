import Atc from '../atc.js'
import Command from '../command.js'

export default class AtcCommand extends Command {
    name = 'atc';
    synopsis = `${process.env.PREFIX}atc [options]... <id>`;
    examples = `${process.env.PREFIX}atc rjtt_app`;
    desc = `live atc command

**ARGUMENTS**
*id*
liveatc.net's file name

**OPTIONS**
*-s, --stop*
stop and leave
`;
    /**
     * @param {any} client client
     * @param {any} message message
     * @param {array} command command
     * @param {string} stdin stdin
     * @return {string} result
     */
    exec(client, message, command, stdin) {
        let id = stdin.length > 0 ? stdin : '';

        for (let i = 2; i < command.length; i++) {
            switch (command[i].content) {
            case '--stop':
            case '-s':
                (Atc.getInstance(message.guild.id) || {stop: () => null}).stop();
                if (!message.member.voice || !message.member.voice.channel) {
                    return 'must be joined to voice channel on this guild';
                }
                message.member.voice.channel.leave();
                return 'stopped';
            default:
                id = command[i].content;
            }
        }

        Atc.create(client, message.guild.id);

        if (!message.member.voice || !message.member.voice.channel) {
            return 'must be joined to voice channel on this guild';
        }

        const result = Atc.getInstance(message.guild.id).play(message.member.voice.channel, id);

        return result ? `playing ${id}` : 'failed';
    }
};
