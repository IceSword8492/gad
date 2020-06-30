export default class Command {
    stdout = 'stdout';

    name = '';
    synopsis = '';
    examples = '';
    desc = '';
    seeAlso = ''; // optional
    /**
     * @param {any} client client
     * @param {any} message message
     * @param {array} command command
     * @param {string} stdin stdin
     * @return {string} result
     */
    exec(client, message, command, stdin) {}
};
