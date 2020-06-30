import ytdl from 'ytdl-core'

import Command from '../command.js'

export default class YtdlCommand extends Command {
    name = 'ytdl';
    synopsis = `${process.env.PREFIX}ytdl [OPTION]... url`;
    examples = `*${process.env.PREFIX}ytdl --quality highest 'https://www.youtube.com/watch?v=82ivsiNImSU' > a.mp4*\ndownload video to a.mp4`;
    desc = `download video from youtube.

**OPTIONS**
*-q, --quality*
set quality param (highest/lowest/highestaudio/lowestaudio/highestvideo/lowestvideo)

*-f, --format*
set format (see [https://github.com/fent/node-ytdl-core/blob/master/typings/index.d.ts#L22](https://github.com/fent/node-ytdl-core/blob/master/typings/index.d.ts#L22))

*-F, -i, --info*
get video info
`;
    seeAlso = '[Formats](https://github.com/fent/node-ytdl-core/blob/master/typings/index.d.ts#L22)';
    /**
     * @param {any} client client
     * @param {any} message message
     * @param {array} command command
     * @param {string} stdin stdin
     * @return {string} result
     */
    async exec(client, message, command, stdin) {
        let uri = stdin.length > 0 ? stdin : null;

        let infoFlag = false;

        const options = {
            quality: 'highest',
        };

        for (let i = 2; i < command.length; i++) {
            switch (command[i].content) {
            case '--quality':
            case '-q':
                // highest/lowest/highestaudio/lowestaudio/highestvideo/lowestvideo
                options.quality = command[++i].content;
                break;
            case '--format':
            case '-f':
                // https://github.com/fent/node-ytdl-core/blob/master/typings/index.d.ts#L22
                options.format = JSON.parse(command[++i].content);
                break;
            case '-F':
            case '--info':
            case '-i':
                infoFlag = true;
            default:
                uri = command[i].content;
            }
        }

        if (infoFlag) {
            const result = await (async () => new Promise(r => ytdl.getInfo(uri, (err, data) => r(data.formats))))();
            return result.map(f => ({
                mimeType: f.mimeType,
                qualityLabel: f.qualityLabel,
                itag: f.itag,
                width: f.width,
                height: f.height,
                quality: f.quality,
                fps: f.fps,
                audioQuality: f.audioQuality,
                audioChannels: f.audioChannels,
                container: f.container,
                live: f.live,
                isHLS: f.isHLS,
                isDashMPD: f.isDashMPD,
            }));
        }

        const result = ytdl(uri, options);

        return result;
    }
};
