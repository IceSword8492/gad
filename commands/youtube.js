import ytdl from 'ytdl-core'

import Command from '../command.js'

export default class GetCommand extends Command {
    name = 'get';
    desc = 'get';
    /**
     * @param {any} client client
     * @param {any} message message
     * @param {array} command command
     * @param {string} stdin stdin
     * @return {string} result
     */
    async exec(client, message, command, stdin) {
        let uri = stdin.length > 0 ? stdin : null;

        ytdl(uri, {
            quality: ''
        });

        return result;
    }
};
