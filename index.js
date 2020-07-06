import { Client, MessageManager } from 'discord.js'
import dotenv from 'dotenv'
import express from 'express'
import sqlite from 'sqlite-async'

import CommandManager from './commandManager.js'

dotenv.config();

const app = express();
const listener = app.listen(process.env.PORT || 8080, () => console.log(`listen on ${listener.address().port}`));

app.get('/', (req, res) => res.send('OK'));

const client = new Client();

client.once('ready', () => console.log('bot ready'));

client.on('message', async message => {
    if (message.author.id === client.user.id) {
        return;
    }
    const result = await CommandManager.execute(client, message);
});

client.login(process.env.TOKEN);

client.on('raw', async (raw) => {
    (CommandManager.listeners.raw || []).forEach(listener => listener(raw));
});

CommandManager.on('raw', async raw => {
    if (raw.t === 'MESSAGE_REACTION_ADD') {
        // console.log(raw.d);
        const emoji = raw.d.emoji;
        const message = await client.guilds.resolve(raw.d.guild_id)
            .channels.resolve(raw.d.channel_id).messages.fetch(raw.d.message_id);
        const user = client.users.resolve(raw.d.user_id);

        if (user.id === client.user.id) {
            return;
        }

        const db = await sqlite.open('./database/main.db');

        const row = await db.get('select * from giveaway where message_id = ?', [raw.d.message_id]);

        if (!row || row.done) {
            return;
        }

        if (emoji.name === '🥺') {
            await db.run('update giveaway set done = ?', [!row.unlimited]);
            if (!row.unlimited) {
                const embed = message.embeds[0];
                embed.title = `~~${embed.title}~~`;
                message.edit(embed);
                message.channel.send(`GG ${user.toString()}, you won giveaway #${row.id}`);
            } else {
                message.channel.send(`GG ${user.toString()}, you won giveaway #${row.id}`);
            }
        }

        if (emoji.name === '❌') {
            await db.run('update giveaway set done = ?', [1]);
            const embed = message.embeds[0];
            embed.title = `~~${embed.title}~~`;
            message.edit(embed);
            message.channel.send(`**Giveaway #${row.id}** is cancelled`);
        }
    }
});
