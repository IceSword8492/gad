import { MessageAttachment } from "discord.js";

export default class FileSender {
    static send(message, fileName, content = '') {
        message.channel.send('', new MessageAttachment(Buffer.from(content), fileName));
    }
};
