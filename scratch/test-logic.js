// Set up mock environment variables for TMDB
process.env.NEXT_PUBLIC_TMDB_BASE_URL = "https://api.themoviedb.org/3";
process.env.NEXT_PUBLIC_TMDB_API_KEY = "mock_key";

const { getDiscoverMovies } = require('./src/lib/discover-logic');

async function test() {
  try {
    const result = await getDiscoverMovies("netflix");
    console.log("Success! Movies found:", result.movies.length);
  } catch (error) {
    console.error("FAILED with error:", error.message);
    console.error(error.stack);
  }
}

test();
