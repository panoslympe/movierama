const apiKey = "bc50218d91157b1ba4f142ef7baaa6a0";
const baseUrl = `https://api.themoviedb.org/3/`;
const nowPlayingUrl = `${baseUrl}movie/now_playing?api_key=${apiKey}`;
const genreUrl = `${baseUrl}genre/movie/list?api_key=${apiKey}`;
const searchUrl = `${baseUrl}search/movie`;
const searchMovieUrl = `${baseUrl}movie`;

const getImage = (image) => {
  return image
    ? `https://image.tmdb.org/t/p/original/${image}`
    : "./assets/icons/noImage.png";
};

const searchbox = document.getElementById("query");
const modal = document.querySelector(".modal");
const mainContainer = document.querySelector(".main-container");
const closeModalBtn = document.querySelector(".close-modal");
const moviesContainer = document.querySelector(".movies");
const moviesTitle = document.querySelector(".movies-title");
moviesTitle.innerHTML = "Playing Now";

const movieListContainer = document.querySelector(".movie-list-container");

const createYouTubeIframe = (videoId) => {
  const iframe = document.createElement("iframe");

  iframe.src = `https://www.youtube.com/embed/${videoId}`;

  iframe.frameborder = 0;

  iframe.allowfullscreen = true;
  iframe.width = 640;
  iframe.height = 390;

  return iframe;
};

//single source of truth
const state = {
  genres: {},
  movies: [],
  searchMovies: [],
  clickedMovie: null,
};

const fetchGenres = async () => {
  const response = await fetch(genreUrl);
  const data = await response.json();
  const returnVal = {};
  data.genres.forEach(({ id, name }) => (returnVal[id] = name));
  state.genres = returnVal;
};

const fetchMovie = async (id) => {
  const movieRes = await fetch(`${searchMovieUrl}/${id}?api_key=${apiKey}`);
  const movieData = await movieRes.json();

  const movieVideoRes = await fetch(
    `${searchMovieUrl}/${id}/videos?api_key=${apiKey}`
  );
  const videoData = await movieVideoRes.json();

  const reviewsRes = await fetch(
    `${searchMovieUrl}/${id}/reviews?api_key=${apiKey}`
  );
  const reviewsData = await reviewsRes.json();

  const similarsRes = await fetch(
    `${searchMovieUrl}/${id}/similar?api_key=${apiKey}`
  );
  const similarData = await similarsRes.json();

  const videoTrailer = videoData.results.find(
    (result) => result.type === "Trailer"
  );
  const reviews = reviewsData.results.slice(0, 2);
  const similar = similarData.results.slice(0, 7);

  return { movie: movieData, trailer: videoTrailer, reviews, similar };
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
    response = await fetch(nowPlayingUrl + `&page=${state.movies.length + 1}`);
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

const createMovieElement = (movie) => {
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

  movieContainer.addEventListener("click", () => {
    handleModal(movie.id);
  });
  return movieContainer;
};

const handleModal = async (movieId) => {
  const movieData = await fetchMovie(movieId);
  createModal(movieData);
};

const createModal = (movieData) => {
  const modalOld = document.querySelector(".modal");
  if (modalOld) {
    modalOld.remove();
  }
  const modal = document.createElement("div");
  modal.classList.add("modal");

  const modalInfo = document.createElement("div");
  modalInfo.classList.add("modal-info");

  const modalInfoTitle = document.createElement("div");
  modalInfoTitle.classList.add("modal-info-title");

  modalInfoTitle.innerHTML = movieData.movie.title;

  const modalHero = document.createElement("div");
  modalHero.classList.add("modal-info-hero");

  const video = document.createElement("div");
  video.classList.add("video");
  if (movieData.trailer?.key) {
    video.appendChild(createYouTubeIframe(movieData.trailer.key));
  } else {
    const noVideo = document.createElement("img");
    noVideo.classList.add("no-video");
    noVideo.src = "./assets/icons/noVideo.png";
    video.appendChild(noVideo);
  }

  const reviews = document.createElement("div");
  const reviewsTitle = document.createElement("h2");
  reviewsTitle.innerHTML = "Reviews";
  reviews.appendChild(reviewsTitle);
  reviews.classList.add("reviews");

  if (movieData.reviews.length) {
    movieData.reviews.forEach((review) => {
      const reviewContainer = document.createElement("div");
      reviewContainer.classList.add("review-container");
      const author = document.createElement("div");
      author.classList.add("author");
      author.innerHTML = review.author;
      const reviewContent = document.createElement("div");
      reviewContent.classList.add("review-content");
      reviewContent.innerHTML = review.content;
      reviewContainer.appendChild(author);
      reviewContainer.appendChild(reviewContent);
      reviews.appendChild(reviewContainer);
    });
  } else {
    const noReviewsAvailable = document.createElement("div");
    noReviewsAvailable.classList.add("no-reviews-available");
    noReviewsAvailable.innerHTML = "No reviews avaiable";
    reviews.appendChild(noReviewsAvailable);
  }

  modalHero.appendChild(video);
  modalHero.appendChild(reviews);

  const similar = document.createElement("div");
  similar.classList.add("similar");

  const similarTitle = document.createElement("h2");
  similarTitle.classList.add("similar-title");
  similarTitle.innerHTML = "Similar";

  similar.appendChild(similarTitle);

  const similarContainer = document.createElement("div");
  similarContainer.classList.add("similar-container");

  similar.appendChild(similarContainer);

  movieData.similar.forEach((item) => {
    const movieContainer = createMovieElement(item);
    similarContainer.appendChild(movieContainer);
  });

  modalInfo.appendChild(modalInfoTitle);
  modalInfo.appendChild(modalHero);
  modalInfo.appendChild(similar);

  const closeButton = document.createElement("button");
  closeButton.classList.add("close-modal");
  closeButton.textContent = "X";
  closeButton.addEventListener("click", () => {
    modal.remove();
  });

  modal.appendChild(modalInfo);
  modal.appendChild(closeButton);

  mainContainer.appendChild(modal);

  return modal;
};

const isScrolledToBottom = () => {
  const scrolledPosition = window.scrollY + window.innerHeight;
  const scrollHeight = document.body.scrollHeight;

  return scrolledPosition >= scrollHeight;
};

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

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
};

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
  searchTerm ? moviesTitle.innerHTML = "Search results:" : moviesTitle.innerHTML = "Playing Now";

  debounce(fetchMovies, 1000)();
});

searchbox.addEventListener("keypress", (event) => {
  if (event.keyCode === 13) {
    event.preventDefault();
  }
});

main();
