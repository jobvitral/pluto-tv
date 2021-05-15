const j2x = require('jsontoxml');
const moment = require('moment');
const fs = require('fs-extra');
const axios = require('axios').default;

class GuideService {
    constructor() {
        this.startTime = encodeURIComponent(moment().format('YYYY-MM-DD HH:00:00.000ZZ'));
        this.stopTime = encodeURIComponent(moment().add(48, 'hours').format('YYYY-MM-DD HH:00:00.000ZZ'));
        this.apiUrl = `http://api.pluto.tv/v2/channels?start=${this.startTime}&stop=${this.stopTime}`;
    }

    getJson = async () => {
        let response = await axios.get(this.apiUrl);

        if (response.status === 200)
            return response.data;
        else
            return null;
    }

    generate = async () => {
        let channels = await this.getJson();
        let guide = [];

        // gera o objeto de guia de programacao
        channels.forEach((channel) => {
            if (channel.isStitched) {
                guide.push({
                    name: 'channel',
                    attrs: { id: channel.slug },
                    children: [
                        { name: 'display-name', text: channel.name },
                        { name: 'display-name', text: channel.number },
                        { name: 'desc', text: channel.summary },
                        { name: 'icon', attrs: { src: channel.solidLogoPNG.path } },
                    ],
                });

                if (channel.timelines) {
                    channel.timelines.forEach((programme) => 
                    {
                        guide.push({
                            name: 'programme',
                            attrs: {
                                start: moment(programme.start).format('YYYYMMDDHHmmss ZZ'),
                                stop: moment(programme.stop).format('YYYYMMDDHHmmss ZZ'),
                                channel: channel.slug,
                            },
                            children: [
                                { name: 'title', attrs: { lang: 'en' }, text: programme.title },
                                {
                                    name: 'sub-title',
                                    attrs: { lang: 'en' },
                                    text:
                                        programme.title == programme.episode.name ? '' : programme.episode.name,
                                },
                                {
                                    name: 'desc', attrs: { lang: 'en' }, 
                                    text: programme.episode.description
                                },
                                {
                                    name: 'date',
                                    text: moment(programme.episode.firstAired).format('YYYYMMDD')
                                },
                                {
                                    name: 'category',
                                    attrs: { lang: 'en' },
                                    text: programme.episode.genre
                                },
                                {
                                    name: 'category',
                                    attrs: { lang: 'en' },
                                    text: programme.episode.subGenre
                                },
                                {
                                    name: 'episode-num',
                                    attrs: { system: 'onscreen' },
                                    text: programme.episode.number
                                }
                            ]
                        });
                    });
                }
            }
        });

        let epg = j2x({ guide }, { prettyPrint: true, escape: true });

        fs.writeFileSync('arquivos/canais_guia.xml', epg);
        console.log(`[SUCCESSO] Arquivo do guia de programacao criado com sucesso\n`);
    }
};

module.exports = GuideService;