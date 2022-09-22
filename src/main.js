const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    },
    params: {
        'api_key': API_KEY,
    },
});


//Utils

const lazyLoader = new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
    //esto es la propiedad para para que aparesca cuando sea visible de la pantalla
        if (entry.isIntersecting){
            const url = entry.target.getAttribute('data-img')
            entry.target.setAttribute('src', url);
        }
    //esto es para observar el elemento y sus propiedades
        // console.log('entry')
        // console.log({entry})
        // const url = movieImg.getAttribute('data-img');
        // movieImg.setAttribute('src', url);
    });
});

function createMovies(movies, container, {lazyLoad=false, clean=true}) {
    if(clean){
        container.innerHTML='';
    }

    movies.forEach(movie => {

        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');
        movieContainer.addEventListener('click', ()=>{
            location.hash = '#movie='+movie.id;
        })

        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title);
        movieImg.setAttribute(
            //cambiamos el atributo para que se cambie despues
            lazyLoad ? 'data-img': 'src',
            'https://image.tmdb.org/t/p/w300/'+ movie.poster_path,
        );
        //usamos este metodo para que en la constante de IntersectionObserver puede usarlo con sus metodos respectivos

        movieImg.addEventListener('error', ()=>{
            movieImg.setAttribute(
                'src',
                'https://static.platzi.com/static/images/error/img404.png',
            );
        });

        if(lazyLoad){
            lazyLoader.observe(movieImg);
        }

        movieContainer.appendChild(movieImg);
        container.appendChild(movieContainer);
    });
}

function createCategories(categories, container) {
    container.innerHTML = "";
    
    categories.forEach(category => {

        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        const categoryTitle = document.createElement('h3');
        categoryTitle.classList.add('category-title');
        categoryTitle.setAttribute('id','id'+category.id);
        categoryTitle.addEventListener('click', ()=>{
            location.hash = `#category=${category.id}-${category.name}`;
        })
        const categoryTitleText = document.createTextNode(category.name);

        categoryTitle.appendChild(categoryTitleText);
        categoryContainer.appendChild(categoryTitle);
        container.appendChild(categoryContainer);
    });
}

//Llamados a la API
async function getTrendingMoviesPreview() {
    const {data} = await api('trending/movie/day');

    const movies = data.results;
    // console.log({data, movies});

    createMovies(movies, trendingMoviesPreviewList, {lazyLoad:true, clean:true});

}

async function getCategoriesPreview() {
    const { data } = await api('genre/movie/list');

    const categories = data.genres;
    // console.log({data, categories});

    // categoriesPreview
    createCategories(categories, categoriesPreviewList,{lazyLoad:true, clean:true});

}

async function getMoviesByCategory(id) {
    const {data} = await api('discover/movie', {
        params: {
            with_genres: id,
        },
    });

    const movies = data.results;
    // console.log({data, movies});

    createMovies(movies, genericSection, {lazyLoad:true, clean:true});

}

async function getMoviesBySearch(query) {
    const {data} = await api('search/movie', {
        params: {
            query,
        },
    });

    const movies = data.results;
    // console.log({data, movies});

    createMovies(movies, genericSection,{lazyLoad:true, clean:true});

}

async function getTrendingMovies() {
    const {data} = await api('trending/movie/day');

    const movies = data.results;
    // console.log({data, movies});

    createMovies(movies, genericSection, { lazyLoad: true, clean: true });

    const btnLoadMore = document.createElement('button');
    btnLoadMore.innerText='Cargar mas';
    btnLoadMore.addEventListener('click', getPaginatedTrendingMovies);
    genericSection.appendChild(btnLoadMore);
    btnLoadMore.addEventListener('click', ()=>{
        genericSection.removeChild(btnLoadMore);
    });

}

let page = 1;

async function getPaginatedTrendingMovies(){
    page++;
    const {data} = await api('trending/movie/day',{
        params: {
            page,
        },
    });

    const movies = data.results;

    createMovies(movies, genericSection,{ lazyLoad: true, clean: false});

    const btnLoadMore = document.createElement('button');
    btnLoadMore.innerText='Cargar mas';
    btnLoadMore.addEventListener('click', getPaginatedTrendingMovies);
    genericSection.appendChild(btnLoadMore);
    btnLoadMore.addEventListener('click', ()=>{
        genericSection.removeChild(btnLoadMore);
    });

}

async function getMovieById(id) {
    const { data: movie} = await api('movie/'+ id);

    const movieImgUrl = 'https://image.tmdb.org/t/p/w500'+movie.poster_path;
    headerSection.style.background = `
    linear-gradient(
        180deg, 
        rgba(0, 0, 0, 0.35) 19.27%, 
        rgba(0, 0, 0, 0) 29.17%
        ),
        url(${movieImgUrl})
    `;

    movieDetailTitle.textContent = movie.title;
    movieDetailDescription.textContent = movie.overview;
    movieDetailScore.textContent = movie.vote_average;

    createCategories(movie.genres, movieDetailCategoriesList);

    getRelateMoviesId(id);
}

async function getRelateMoviesId(id){
    const { data } = await api(`movie/${id}/recommendations`);
    const relatedMovies = data.results;

    createMovies(relatedMovies, relatedMoviesContainer, {lazyLoad:true, clean:true});
    //para que le scroll sea desde el inicio
    relatedMoviesContainer.scrollTo(0, 0);
}