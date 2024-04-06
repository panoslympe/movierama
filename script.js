const apiKey = "bc50218d91157b1ba4f142ef7baaa6a0";
const baseUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;
const nowPlayingUrl = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}`;
const genreMovieList = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`;
const searchUrl = "https://api.themoviedb.org/3/search/movie";

const getImage = (image) => `https://image.tmdb.org/t/p/original/${image}`;

const searchbox = document.getElementById("query");

const movieListContainer = document.querySelector(".movie-list-container");

//single-source of truth
const state = {
  genres: {},
  movies: [],
  searchMovies: [],
};

const fetchGenres = async () => {
  const response = await fetch(genreMovieList);
  const data = await response.json();
  const returnVal = {};
  data.genres.forEach(({ id, name }) => (returnVal[id] = name));
  state.genres = returnVal;
};

const fetchMovies = async () => {
  let response;

  if (searchbox.value) {
    response = await fetch(
      `${searchUrl}?query=${searchbox.value}&page=${
        state.searchMovies.length + 1
      }&api_key=${apiKey}`
    );
    const data = await response.json();

    state.searchMovies = [
      ...state.searchMovies,
      { page: data.page, movieList: data.results },
    ];
  } else {
    response = await fetch(baseUrl + `&page=${state.movies.length + 1}`);
    const data = await response.json();
    state.movies = [
      ...state.movies,
      { page: data.page, movieList: data.results },
    ];
  }
  renderMovies();
};

const main = async () => {
  await fetchGenres();
  await fetchMovies();
};

const renderMovies = () => {
  let moviesToRender = searchbox.value ? state.searchMovies : state.movies;

  moviesToRender[moviesToRender.length - 1].movieList.forEach((movie) => {
    const movieContainer = createMovieElement(movie);
    movieListContainer.appendChild(movieContainer);
  });
};

// Function to create the movie component element
function createMovieElement(movie) {
  const movieContainer = document.createElement("div");
  movieContainer.classList.add("movie-container");

  const poster = document.createElement("img");
  poster.classList.add("movie-poster");
  poster.src = getImage(movie.backdrop_path);

  const movieInfo = document.createElement("div");
  movieInfo.classList.add("movie-info");

  const title = document.createElement("h2");
  title.classList.add("movie-title");
  title.textContent = movie.title;

  const releaseYear = document.createElement("p");
  releaseYear.classList.add("movie-release-year");
  releaseYear.textContent = `Release: ${movie.release_date}`;

  const genre = document.createElement("p");
  genre.classList.add("movie-genre");
  genre.textContent = `Genre(s): ${movie.genre_ids
    .map((genreId) => state.genres[genreId])
    .join(", ")}`;

  const voteNumber = document.createElement("span");
  voteNumber.classList.add("vote-number");
  voteNumber.textContent = movie.vote_average;

  const voteAverage = document.createElement("p");
  voteAverage.classList.add("movie-vote-average");
  voteAverage.textContent = `Vote Average: `;
  voteAverage.appendChild(voteNumber);

  const overview = document.createElement("p");
  overview.classList.add("movie-overview");
  overview.textContent = movie.overview;

  movieInfo.appendChild(title);
  movieInfo.appendChild(releaseYear);
  movieInfo.appendChild(genre);
  movieInfo.appendChild(voteAverage);
  movieInfo.appendChild(overview);

  movieContainer.appendChild(poster);
  movieContainer.appendChild(movieInfo);

  return movieContainer;
}

// and alternative choice to the bellow function was for me to implement Intersection Observer API but I chose that one
function isScrolledToBottom() {
  const scrolledPosition = window.scrollY + window.innerHeight;
  const scrollHeight = document.body.scrollHeight;

  return scrolledPosition >= scrollHeight;
}

window.addEventListener("scroll", () => {
  const isAtBottom = isScrolledToBottom();
  if (isAtBottom) {
    throttle(() => fetchMovies(), 1000)();
  }
});

isScrolledToBottom();

let prev = 0;
const throttle = (func, delay) => {
  return (...args) => {
    let now = new Date().getTime();

    if (now - prev > delay) {
      prev = now;
      return func(...args);
    }
  };
};

function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

const resetState = () => {
  state.movies = [];
  state.searchMovies = [];
};

const debouncedSearch = debounce(() => fetchMovies(), 1000);

searchbox.addEventListener("input", (event) => {
  event.preventDefault();
  const searchTerm = event.target.value;
  movieListContainer.innerHTML = "";
  resetState();

  debounce(fetchMovies, 1000)();
});

searchbox.addEventListener("input", (event) => {
  event.preventDefault();
  const searchTerm = event.target.value;
  movieListContainer.innerHTML = "";
  resetState();

  debounce(fetchMovies, 1000)();
});

searchbox.addEventListener("keypress", (event) => {
  if (event.keyCode === 13) {
    event.preventDefault();
  }
});

main();
