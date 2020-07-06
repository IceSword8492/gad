import fs from 'fs'

import Command from '../command.js'

export default class HelpCommand extends Command {
    name = 'help';
    synopsis = `${process.env.PREFIX}help [command]`;
    examples = `*${process.env.PREFIX}help help*\nshow help of help command`;
    desc = `help command`;
    seeAlso = `type \`${process.env.PREFIX}help\` to see list of all commands`;
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
                const embed = {
                    embed: {
                        title: iclazz.name,
                        color: 0xff0000,
                        footer: {
                            text: "GAD"
                        },
                        author: {
                            name: "Help"
                        },
                        fields: [
                            {
                                name: "**SYNOPSIS**",
                                value: iclazz.synopsis
                            },
                            {
                                name: "**DESCRIPTION**",
                                value: iclazz.desc
                            },
                            {
                                name: '**EXAMPLES**',
                                value: iclazz.examples
                            }
                        ]
                    }
                };

                if (iclazz.seeAlso && typeof iclazz.seeAlso === 'string' && iclazz.seeAlso.length > 0) {
                    embed.embed.fields.push({
                        name: '**SEE ALSO**',
                        value: iclazz.seeAlso
                    });
                }

                return embed;
            }
            if (cmd.length === 0) {
                all += `> ${iclazz.name}\n`;
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
