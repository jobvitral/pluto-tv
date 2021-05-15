// carrega as dependencias
const ChannelService = require('./services/channel');
const GuideService = require('./services/guide');
const MovieService = require('./services/movie');
const SerieService = require('./services/serie');

//inicializa as classes
const channelService = new ChannelService();
const guideService = new GuideService();
const movieService = new MovieService();
const serieService = new SerieService();

// função que gera as listas
const generate = async () => {
    // gera as listas
    console.log('Gerando a lista de canais');
    await channelService.generate();

    console.log('Gerando o guia de programação');
    await guideService.generate();

    console.log('Gerando lista de filmes OnDemand - Separadas');
    await movieService.generate();

    console.log('Gerando lista de filmes OnDemand - Geral');
    await movieService.generateAll();

    console.log('Gerando lista de series OnDemand - Separadas');
    console.log('Pode demorar alguns minutos');
    await serieService.generate();

    console.log('Gerando lista de series OnDemand - Geral');
    console.log('Pode demorar alguns minutos');
    await serieService.generateAll();

    console.log('Listas geradas com sucesso');
}

//executa a função que gera as listas
generate();