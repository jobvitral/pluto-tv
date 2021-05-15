const moment = require('moment');
const fs = require('fs-extra');
const uuid4 = require('uuid').v4;
const uuid1 = require('uuid').v1;
const url = require('url');
const axios = require('axios').default;

class ChannelService {
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
        let m3u8 = `#EXTM3U x-tvg-url="http://plutotv.ecolinx.com.br/arquivos/canais_guia.xml"\n\n`;

        // gera o arquivo da playlist
        channels.forEach((channel) => 
        {
            let deviceId = uuid1();
            let sid = uuid4();
            
            if (channel.isStitched) 
            {
                let m3uUrl = new URL(channel.stitched.urls[0].url);
                let queryString = url.search;
                let params = new URLSearchParams(queryString);

                // seta os parametros da url
                params.set('advertisingId', '');
                params.set('appName', 'web');
                params.set('appVersion', 'unknown');
                params.set('appStoreUrl', '');
                params.set('architecture', '');
                params.set('buildVersion', '');
                params.set('clientTime', '0');
                params.set('deviceDNT', '0');
                params.set('deviceId', deviceId);
                params.set('deviceMake', 'Chrome');
                params.set('deviceModel', 'web');
                params.set('deviceType', 'web');
                params.set('deviceVersion', 'unknown');
                params.set('includeExtendedEvents', 'false');
                params.set('sid', sid);
                params.set('userId', '');
                params.set('serverSideAds', 'true');

                m3uUrl.search = params.toString();
                m3uUrl = m3uUrl.toString();

                let slug = channel.slug;
                let logo = channel.solidLogoPNG.path;
                let group = channel.category;
                let name = channel.name;

                m3u8 = m3u8 + `#EXTINF:0 channel-id="${slug}" tvg-logo="${logo}" group-title="${group}", ${name}\n`;
                m3u8 = m3u8 +  `${m3uUrl}\n\n`;
            } 
            else 
            {
                console.log(`[DEBUG] Pulando canal 'fake' "${channel.name}"`);
            }
        });

        fs.writeFileSync('arquivos/canais.m3u8', m3u8);
        console.log(`[SUCCESSO] Arquivo da lista de canais criado com sucesso\n`);
    }
};

module.exports = ChannelService;