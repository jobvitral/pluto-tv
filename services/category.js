const j2x = require('jsontoxml');
const fs = require('fs-extra');
const axios = require('axios').default;

class CategoryService {
    constructor() {
        this.apiUrl = `http://api.pluto.tv/v3/vod/categories?includeItems=true&deviceType=web`;
    }

    getJson = async () => {
        let response = await axios.get(this.apiUrl);

        if (response.status === 200)
            return response.data.categories;
        else
            return null;
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
};

module.exports = CategoryService;