const apiKey = '745319c67fb2efc547a6b888616b2253';
const baseUrl = 'https://api.themoviedb.org/3/movie/popular?api_key=';

const url = baseUrl + apiKey;

async function getMovies () {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        return data;
      } catch (error) {
        console.error(error);
      }
}

getMovies();