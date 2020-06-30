import stream from 'stream'

import axios from 'axios'
import ffmpeg from 'basicFFmpeg'

export default class Atc {
    static instances = {};

    static create(client, guildId) {
        if (!this.instances[guildId] || !(this.instances[guildId] instanceof Atc)) {
            new Atc(client, guildId);
        }
    }

    /**
     * @private
     */
    constructor(client, guildId) {
        this.client = client;
        this.guildId = guildId;

        this.id = null;
        this.connection = null;
        this.dispatcher = null;

        Atc.instances[guildId] = this;
    }

    static getInstance(guildId) {
        return this.instances[guildId];
    }

    async play(channel, id) {
        this.stop();

        if (!channel || !channel.join) {
            return false;
        }

        this.id = id;
        this.connection = await channel.join();

        console.log(`https://s1-fmt2.liveatc.net/${this.id}?nocache=${new Date().getTime()}`); // debug

        const response = await axios({
            method: 'get',
            url: `https://s1-fmt2.liveatc.net/${this.id}?nocache=${new Date().getTime()}`,
            responseType: 'stream',
        }).catch(e => console.warn(e));

        if (!response || !response.data || !response.data.pipe) {
            console.warn('invalid response type');
            return false;
        }

        const pass = new stream.PassThrough();

        const processor = ffmpeg.createProcessor({
            inputStream: response.data,
            outputStream: pass,
            emitInputAudioCodecEvent: true,
            emitInfoEvent: true,
            emitProgressEvent: true,
            niceness: 10,
            timeout:0,
            arguments: {
                '-f': 'ogg',
                '-acodec': 'libopus',
                '-application': 'voip',
            },
        })
            .on('info', function (infoLine) {
                // console.log(infoLine);
            })
            .on('inputAudioCodec', function (codec) {
                console.log('input audio codec is: ' + codec);
            })
            .on('success', function (retcode, signal) {
                // console.log('process finished successfully with retcode: ' + retcode + ', signal: ' + signal);
            })
            .on('failure', function (retcode, signal) {
                console.log('process failure, retcode: ' + retcode + ', signal: ' + signal);
            })
            .on('progress', function (bytes) {
                // console.log('process event, bytes: ' + bytes);
            })
            .on('timeout', function (processor) {
                console.log('timeout event fired, stopping process.');
                processor.terminate();
            });

        processor.execute();

        this.dispatcher = this.connection.play(pass, {
            type: 'ogg/opus',
        });

        this.dispatcher.on('error', console.error);

        return true;
    }

    stop() {
        if (this.dispatcher !== null) {
            this.dispatcher.pause();
            this.dispatcher.destroy();
        }
        if (this.connection !== null) {
            this.connection = null;
        }
    }
};
