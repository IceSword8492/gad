import axios from 'axios'

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
        let responseType = 'text';

        if (uri === null) {
            for (let i = 0; i < command.length; i++) {
                switch (command[i].content) {
                case '--type':
                case '-t':
                    i++;
                    responseType = command[i].content;
                    break;
                default:
                    uri = command[i].content;
                }
            }
        }

        const options = {
            responseType: 'arraybuffer',
        };

        const _result = await axios.get(uri, options);

        let result = '';

        switch (responseType) {
        case 'text':
            result = Buffer.from(_result.data, 'binary').toString();
            break;
        case 'image':
        case 'binary':
            result = _result.data;
            break;
        }

        return result;
    }
};
