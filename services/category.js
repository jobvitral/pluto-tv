const j2x = require('jsontoxml');
const fs = require('fs-extra');
const axios = require('axios').default;

class CategoryService {
    constructor() {
        this.apiUrl = `http://api.pluto.tv/v3/vod/categories?includeItems=true&deviceType=web&offset=1000`;
    }

    getJson = async () => {
        let response = await axios.get(this.apiUrl);

        if (response.status === 200)
            return response.data.categories;
        else
            return null;
    }

    getJsonSeasons = async (idSerie) => {
        let serieUrl = `http://api.pluto.tv/v3/vod/series/${idSerie}/seasons?includeItems=true&deviceType=web&offset=500`
        let response = await axios.get(serieUrl);

        if (response.status === 200)
            return response.data.seasons;
        else
            return [];
    }

    getMovieCategories = async () => 
    {
        let categories = await this.getJson();
        let result = [];

        // faz loop nas categorias criando as listas
        categories.forEach((category) => 
        {
            let movies = category.items.filter(a => a.type === 'movie');

            // verifica se tem filmes
            if(movies.length > 0)
            {
                let cover = movies[0].covers.length > 0 ? movies[0].covers[0].url : movies[0].featuredImage.path;
                
                let filename = category.name
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s/g, '_')
                    .toLowerCase();

                let item = {
                    id: category._id,
                    name: category.name,
                    filename: `filmes_${filename}.m3u8`,
                    cover: cover,
                    items: movies.map(a => {
                        return {
                            id: a._id,
                            name: a.name,
                            summary: a.summary,
                            genre: a.genre,
                            cover: a.covers[0].url,
                            url: a.stitched.urls[0].url
                        }
                    })
                };

                result.push(item);
            }
        });

        return result;
    }

    getSerieCategories = async () => 
    {
        let categories = await this.getJson();
        let result = [];

        // faz loop nas categorias criando as listas
        for(const category of categories)
        {
            let series = category.items.filter(a => a.type === 'series');

            // verifica se tem filmes
            if(series.length > 0)
            {
                let cover = series[0].covers.length > 0 ? series[0].covers[0].url : series[0].featuredImage.path;
                
                let filename = category.name
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s/g, '_')
                    .toLowerCase();

                // itens da categoria
                let item = {
                    id: category._id,
                    name: category.name,
                    filename: `series_${filename}.m3u8`,
                    cover: cover,
                    items: series.map(a => 
                    {
                        return {
                            id: a._id,
                            name: a.name,
                            summary: a.summary,
                            genre: a.genre,
                            cover: a.covers[0].url,
                            url: a.stitched.urls[0].url,
                            episodes: []
                        }
                    })
                };

                //carrega os episodios da serie
                for(const serie of item.items)
                {
                    let episodes = await this.getEpisodes(serie.id);
                    
                    episodes.forEach((episode) => 
                    {
                        episode.cover = serie.cover;
                        serie.episodes.push(episode);
                    });
                };

                result.push(item);
            }
        };

        return result;
    }

    getEpisodes = async (idSerie) => {
        let seasons = await this.getJsonSeasons(idSerie.toString());
        let episodes = [];
        
        if(seasons !== undefined)
        {
            seasons.forEach((season) => 
            {
                season.episodes.forEach((episode) => 
                {
                    let item = {
                        id: episode._id,
                        name: `S${ episode.season.toString().padStart(2, '0') } Ep. ${ episode.number.toString().padStart(3, '0') } - ${episode.name}`,
                        summary: episode.description,
                        genre: episode.genre,
                        cover: episode.covers[0].url,
                        url: episode.stitched.urls[0].url
                    };

                    episodes.push(item);
                });
            });
        }

        return episodes;
    }
};

module.exports = CategoryService;