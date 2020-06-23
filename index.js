import { Client } from 'discord.js'
import dotenv from 'dotenv'
import express from 'express'

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
