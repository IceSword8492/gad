import fs from 'fs'

import FileSender from './fileSender.js'
import Parser from './parser.js'

export default class CommandManager {
    static cbs = [];
    static listeners = {};
    static async execute(client, message) {
        await this.getCommandClasses();

        const commands = Parser.parse(message.content);
        let result = '';
        let stdout = 'stdout';

        if (commands && typeof commands === 'object') {
            if (commands.length < 1) {
                return null;
            }
            if (commands[0] && ((commands[0][0] && commands[0][0].type !== 'prefix') && (commands[0][1] && commands[0][1].type !== 'prefix'))) {
                return null;
            }
        }

        for (let command of commands) {
            if (command[0].type === 'stdout') {
                stdout = command[0].content;
                command.shift();
            } else {
                stdout = 'stdout';
            }

            if (stdout === 'file' && command[0].type !== 'prefix') {
                const fileName = command[0].content;
                FileSender.send(message, fileName, result);
                continue;
            }

            for (let clazz of this.commandClasses) {
                const iclazz = new clazz.default();
                if (command[0].type === 'prefix' || (command[0].type === 'stdout' && command[1].type === 'prefix')) {
                    if (iclazz.name === command.find(c => c.type === 'string').content) {
                        result = await iclazz.exec(client, message, command, result, stdout);
                        switch (stdout) {
                        case 'stdout':
                            if (
                                typeof result !== 'string'
                                && (
                                    typeof result === 'object'
                                    && !result.embed
                                )
                            ) {
                                try {
                                    result = JSON.stringify(result, 0, 4);
                                } catch {}
                            }
                            const m = await message.channel.send(typeof result === 'string' ? result.substring(0, 2000) : result);
                            for (const cb of this.cbs) {
                                await cb(m);
                            }
                            this.cbs = [];
                            result = '';
                        }
                    }
                }
            }
        }
    }

    static async getCommandClasses() {
        this.commandClasses = [];

        const files = fs.readdirSync('./commands', {withFileTypes: true});

        for (let file of files) {
            if (file.isDirectory()) {
                return;
            }

            this.commandClasses.push(await import(`./commands/${file.name}`));
        }
    }

    static afterSendMessage(cb) {
        if (typeof cb === 'function') {
            this.cbs.push(cb);
        }
    }

    static on(type, listener) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(listener);
    }
}
