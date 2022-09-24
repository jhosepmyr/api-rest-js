//DATA

const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    },
    params: {
        'api_key': API_KEY,
    },
});

function likedMoviesList(){
    const item =JSON.parse( localStorage.getItem('liked_movies'));
    let movies;

    //esta validacion es para q si este vacio no se null o indefinido sino un objeto vacio
    if(item){
        movies = item;
    } else{
        movies = {};
    }
    return movies;
}

function likeMovie(movie){
    const likedMovies = likedMoviesList();
    //esto es igual al objeto {'liked_movies',{idmovie1:datos1, id2movie:datos2}}

    if(likedMovies[movie.id]){
        //quitar los valores de la pelicula
        //para que no este e el array esto es cuando hagamos el segundo click para quitar de favoritos
        likedMovies[movie.id]=undefined;

    }else{
        //darle los nuevos valores a la pelicula
        likedMovies[movie.id]=movie;
    }

    localStorage.setItem('liked_movies',JSON.stringify(likedMovies));
    console.log(localStorage.getItem('liked_movies'));
}


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

        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title);
        movieImg.setAttribute(
            //cambiamos el atributo para que se cambie despues
            lazyLoad ? 'data-img': 'src',
            'https://image.tmdb.org/t/p/w300/'+ movie.poster_path,
        );
        //usamos este metodo para que en la constante de IntersectionObserver puede usarlo con sus metodos respectivos

        movieImg.addEventListener('click', ()=>{
            location.hash = '#movie='+movie.id;
        })

        movieImg.addEventListener('error', ()=>{
            movieImg.setAttribute(
                'src',
                'https://static.platzi.com/static/images/error/img404.png',
            );
        });

        const movieBtn = document.createElement('button');
        movieBtn.classList.add('movie-btn');
        movieBtn.addEventListener('click',()=>{
            movieBtn.classList.toggle('movie-btn--liked');
            likeMovie(movie);
        });

        if(lazyLoad){
            lazyLoader.observe(movieImg);
        }

        movieContainer.appendChild(movieImg);
        movieContainer.appendChild(movieBtn);
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
    maxPage = data.total_pages;

    createMovies(movies, genericSection, {lazyLoad:true, clean:true});

}

function getPaginatedMoviesByCategory(id) {
    return async function(){
        const { 
            scrollTop, 
            scrollHeight, 
            clientHeight 
        } = document.documentElement;
      
        const scrollIsBottom = scrollTop + clientHeight >= scrollHeight - 15;
      
        const pageIsNotMax = page < maxPage;
      
        if (scrollIsBottom  && pageIsNotMax) {
          page++;
          const {data} = await api('discover/movie', {
            params: {
                with_genres: id,
                page,
            },
        });
    
        const movies = data.results;
          // console.log({data, movies});
    
          createMovies(
            movies, 
            genericSection, 
            { lazyLoad: true, clean: false }
          );
        }
      
    }
  //   const btnLoadMore = document.createElement("button");
  //   btnLoadMore.innerText = "Cargar mas";
  //   btnLoadMore.addEventListener("click", getPaginatedTrendingMovies);
  //   genericSection.appendChild(btnLoadMore);
  //   btnLoadMore.addEventListener("click", () => {
  //     genericSection.removeChild(btnLoadMore);
  //   });
}

async function getMoviesBySearch(query) {
    const {data} = await api('search/movie', {
        params: {
            query,
        },
    });

    const movies = data.results;
    maxPage = data.total_pages;
    console.log(maxPage)
    // console.log({data, movies});

    createMovies(movies, genericSection,{lazyLoad:true, clean:true});

}

function getPaginatedMoviesBySearch(query) {
    return async function(){
        const { 
            scrollTop, 
            scrollHeight, 
            clientHeight 
        } = document.documentElement;
      
        const scrollIsBottom = scrollTop + clientHeight >= scrollHeight - 15;
      
        const pageIsNotMax = page < maxPage;
      
        if (scrollIsBottom  && pageIsNotMax) {
          page++;
          const { data } = await api("search/movie", {
            params: {
              query,
              page,
            },
          });
    
          const movies = data.results;
          // console.log({data, movies});
    
          createMovies(
            movies, 
            genericSection, 
            { lazyLoad: true, clean: false }
          );
        }
      
    }
  //   const btnLoadMore = document.createElement("button");
  //   btnLoadMore.innerText = "Cargar mas";
  //   btnLoadMore.addEventListener("click", getPaginatedTrendingMovies);
  //   genericSection.appendChild(btnLoadMore);
  //   btnLoadMore.addEventListener("click", () => {
  //     genericSection.removeChild(btnLoadMore);
  //   });
}

async function getTrendingMovies() {
    const {data} = await api('trending/movie/day');

    const movies = data.results;
    maxPage = data.total_pages;
    // console.log({data, movies});

    createMovies(movies, genericSection, { lazyLoad: true, clean: true });

    // const btnLoadMore = document.createElement('button');
    // btnLoadMore.innerText='Cargar mas';
    // btnLoadMore.addEventListener('click', getPaginatedTrendingMovies);
    // genericSection.appendChild(btnLoadMore);
    // btnLoadMore.addEventListener('click', ()=>{
    //     genericSection.removeChild(btnLoadMore);
    // });

}

async function getPaginatedTrendingMovies() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  const scrollIsBottom = scrollTop + clientHeight >= scrollHeight - 15;

  const pageIsNotMax = page < maxPage;

  if (scrollIsBottom  && pageIsNotMax) {
    page++;
    const { data } = await api("trending/movie/day", {
      params: {
        page,
      },
    });

    const movies = data.results;

    createMovies(movies, genericSection, { lazyLoad: true, clean: false });
  }

//   const btnLoadMore = document.createElement("button");
//   btnLoadMore.innerText = "Cargar mas";
//   btnLoadMore.addEventListener("click", getPaginatedTrendingMovies);
//   genericSection.appendChild(btnLoadMore);
//   btnLoadMore.addEventListener("click", () => {
//     genericSection.removeChild(btnLoadMore);
//   });
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