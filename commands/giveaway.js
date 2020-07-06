import sqlite from 'sqlite-async'

import Command from '../command.js'
import CommandManager from '../commandManager.js'

export default class GiveawayCommand extends Command {
    name = 'giveaway';
    synopsis = `${process.env.PREFIX}giveaway [options]... <itemname>`;
    examples = `${process.env.PREFIX}giveaway --require 'Active Rank or Above and MVP+ or Above' --url 'https://gyazo.com/0ae38d9f128e4405e20e757d86025796' 'Mystical Mushroom Soup x2'`;
    desc = `giveaway command

**OPTIONS**
*--require, -r*
requirements to receive items

*--url, -u*
url of the image

*--infinite, -inf, -i*
unlimited amount of items for giveaway
`;
    /**
     * @param {any} client client
     * @param {any} message message
     * @param {array} command command
     * @param {string} stdin stdin
     * @return {string} result
     */
    async exec(client, message, command, stdin) {
        const options = {
            require: null,
            url: null,
            infinite: false,
            itemName: '***NO ITEM***',
        };

        for (let i = 2; i < command.length; i++) {
            switch (command[i].content) {
            case '--require':
            case '-r':
                options.require = command[++i].content;
                break;
            case '--url':
            case '-u':
                options.url = command[++i].content;
                break;
            case '--infinite':
            case '-inf':
            case '-i':
                options.infinite = true;
                break;
            default:
                options.itemName = command[i].content;
            }
        }

        const con = await sqlite.open(`${process.pwd}/../database/main.db`);
        const {maxId} = await con.get('select max(id) as maxId from giveaway') || 0;
        await con.close();

        const embed = {
            embed: {
                title: `**【Giveaway #${maxId + 1}】**`,
                color: 0xdddddd,
                footer: {
                    text: "GAD"
                },
                author: {
                    name: "Giveaway"
                },
                fields: [
                    {
                        name: '**Author**',
                        value: message.author.toString()
                    },
                    {
                        name: '**Item**',
                        value: options.itemName
                    },
                    {
                        name: '**Requirements**',
                        value: options.require || 'None'
                    }
                ]
            }
        };

        if (options.url) {
            embed.embed.image = {
                url: options.url
            };
        }

        CommandManager.afterSendMessage(async m => {
            await m.react('🥺');
            await m.react('❌');

            const con = await sqlite.open(`${process.pwd}/../database/main.db`);
            await con.run('insert into giveaway (id, message_id, done, unlimited) values (?, ?, ?, ?)', [maxId + 1, m.id, 0, options.infinite]);
            await con.close();
        });

        return embed;
    }
};
