const moment = require('moment');
const fs = require('fs-extra');
const uuid4 = require('uuid').v4;
const uuid1 = require('uuid').v1;
const url = require('url');
const axios = require('axios').default;
const CategoryService = require('./category');

class SerieService 
{
    constructor() 
    {
        this.categoryService = new CategoryService();
        this.startTime = encodeURIComponent(moment().format('YYYY-MM-DD HH:00:00.000ZZ'));
        this.stopTime = encodeURIComponent(moment().add(48, 'hours').format('YYYY-MM-DD HH:00:00.000ZZ'));
    }

    getCategories = async () => 
    {
        let response = await this.categoryService.getSerieCategories();

        return response;
    }

    generate = async () => {
        let categories = await this.getCategories();
        
        // gera o arquivo da playlist
        categories.forEach((categorie) => 
        {
            let m3u8 = `#EXTM3U\n\n`;
            
            //ordena os items por ordem alfabetica
            categorie.items.sort((a, b) => {
                return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
            });
            
            //faz loop nas series
            categorie.items.forEach((serie) => 
            {
                //ordena os episodios
                serie.episodes.sort((a, b) => {
                    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
                });

                //adiciona os episodios
                serie.episodes.forEach((episode) => 
                {
                    let deviceId = uuid1();
                    let sid = uuid4();
                    let m3uUrl = new URL(episode.url);
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

                    m3u8 = m3u8 + `#EXTINF:0 channel-id="${episode.id}" tvg-logo="${episode.cover}" group-title="${serie.name}", ${episode.name}\n`;
                    m3u8 = m3u8 +  `${m3uUrl}\n\n`;
                });
            });

            fs.writeFileSync(`arquivos/${categorie.filename}`, m3u8);
        });

        
        console.log(`[SUCCESSO] Arquivo da lista de series por categoria criado com sucesso\n`);
    }

    generateAll = async () => 
    {
        let categories = await this.getCategories();
        let m3u8 = `#EXTM3U\n\n`;
        let listaGeral = [];

        // cria uma nova lista a partir da lista de categorias
        categories.forEach((categorie) => 
        {
            categorie.items.forEach((serie) => 
            {
                //verifica se a serie ja esta na lista
                let index = listaGeral.findIndex(a => a.id === serie.id);

                if(index === -1)
                {
                    // ordena a lista de episodios por nome
                    serie.episodes.sort(function(a,b) {
                        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
                    });
                    
                    //adiciona os episodios na lista
                    serie.episodes.forEach((episode) => 
                    {
                        listaGeral.push({...episode, serieName: serie.name});
                    });
                }
            });
        });

        //ordena a lista por nome
        listaGeral.sort(function(a,b) {
            return a.serieName < b.serieName ? -1 : a.serieName > b.serieName ? 1 : 0;
        });

        // gera o arquivo da playlist
        listaGeral.forEach((episode) => 
        {
            let deviceId = uuid1();
            let sid = uuid4();
            
            let m3uUrl = new URL(episode.url);
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

            m3u8 = m3u8 + `#EXTINF:0 channel-id="${episode.id}" tvg-logo="${episode.cover}" group-title="${episode.serieName}", ${episode.name}\n`;
            m3u8 = m3u8 +  `${m3uUrl}\n\n`;
        });

        fs.writeFileSync(`arquivos/serie.m3u8`, m3u8);
        console.log(`[SUCCESSO] Arquivo da lista completa de series criado com sucesso\n`);
    }
};

module.exports = SerieService;