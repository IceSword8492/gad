import { MessageAttachment } from 'discord.js'

export default class FileSender {
    static send(message, fileName, content = '') {
        if (typeof content === 'string') {
            try {
                content = JSON.parse(content);
            } catch (e) {console.error(e)}
        }
        message.channel.send('', new MessageAttachment(typeof content === 'string' ? Buffer.from(content) : content, fileName));
    }
};
