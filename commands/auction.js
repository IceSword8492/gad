// ! DO NOT USE THIS COMMAND NOW
// ! UNDER DEVELOPMENT

import Command from '../command.js'
import Database from '../database.js'

export default class AuctionCommand extends Command {
    name = 'auction';
    desc = 'skyblock guild auction';
    /**
     * @param {any} client client
     * @param {any} message message
     * @param {array} command command
     * @param {string} stdin stdin
     * @return {string} result
     */
    exec(client, message, command, stdin) {
        const options = {
            itemName: 'unknown',
            price: 0,
            type: 'auction',
            unit: 1000,
            duration: 6 * 60 * 60 * 1000  // 6h
        };

        for (let i = 0; i < command.length; i++) {
            switch (command[i].content) {
            case '--price':
            case '--starting-bid':
            case '-p':
            case '-s':
                options.price = parseFloat(command[++i].content);
            case '--type':
            case '-t':
                // auction or BIN
                options.type = command[++i].content;
            case '--unit':
            case '-u':
                options.unit = parseFloat(command[++i].content);
            case '--duration':
            case '-d':
                options.duration = parseInt(command[++i].content)  // あとで??d??h??m??s表記に対応予定
            default:
                options.itemName = command[i].content;
            }
        }

        Database.db.run('insert into auctions (message_id, item_name, price, type, unit, duration) values ()');
    }
};
