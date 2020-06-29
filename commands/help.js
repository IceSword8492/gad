import fs from 'fs'

import Command from '../command.js'

export default class HelpCommand extends Command {
    name = 'help';
    desc = 'help';
    /**
     * @param {any} client client
     * @param {any} message message
     * @param {array} command command
     * @param {string} stdin stdin
     * @return {string} result
     */
    async exec(client, message, command, stdin) {
        await this.getCommandClasses();

        let cmd = stdin;

        for (let i = 2; i < command.length; i++) {
            switch (command[i].content) {
            default:
                cmd = command[i].content;
            }
        }

        let all = '';

        for (let clazz of this.commandClasses) {
            const iclazz = new clazz.default();
            if (cmd.length > 0 && iclazz.name === cmd) {
                return `${iclazz.name}\n${iclazz.desc}`;
            }
            if (cmd.length === 0) {
                all += `${iclazz.name}\n${iclazz.desc}\n\n`;
            }
        }

        return all.length > 0 ? all : 'command not found';
    }

    async getCommandClasses() {
        this.commandClasses = [];

        const files = fs.readdirSync('./commands/', {withFileTypes: true});

        for (let file of files) {
            if (file.isDirectory()) {
                return;
            }

            this.commandClasses.push(await import(`./${file.name}`));
        }
    }
};
