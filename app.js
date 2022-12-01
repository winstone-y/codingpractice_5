const express = require("express");
const app = express();
app.use(express.json());
module.exports = app;

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");

let db;
const dbPath = path.join(__dirname, "moviesData.db");
console.log(dbPath);

// Initialize database and server

const intitializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

intitializeDbAndServer();

app.get("/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
    * 
    FROM 
    movie
    ORDER BY director_id;    
    `;
  const movies = await db.all(getMoviesQuery);

  response.send(movies);
});

//List of Movie Names From movie API 1

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
    * 
    FROM 
    movie 
    ORDER BY 
    movie_id;    
    `;
  const movies = await db.all(getMoviesQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };
  const moviesList = movies.map((m) => convertDbObjectToResponseObject(m));

  response.send(moviesList);
});

// ADD NEW MOVIE IN movie table POST API 2
app.post("/movies/", async (request, response) => {
  const movieData = request.body;
  const { directorId, movieName, leadActor } = movieData;
  const postNewMovieQuery = `
    INSERT 
    INTO 
    movie (director_id,movie_name,lead_actor) 
    VALUES (
        '${directorId}',
        '${movieName}',
        '${leadActor}'
    )
    ;`;
  await db.run(postNewMovieQuery);
  response.send("Movie Successfully Added");
});

// GET MOVIE FROM movie table GET API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieQuery = `
    SELECT * FROM movie WHERE movie_id=${movieId};`;

  const movies = await db.get(getMovieQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    };
  };
  const moviesList = convertDbObjectToResponseObject(movies);

  response.send(moviesList);
});

// UPDATE MOVIE IN movie table PUT API 4
app.put("/movies/:movieId/", async (request, response) => {
  const movieData = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = movieData;

  const updateMovieQuery = `
    UPDATE 
    movie 
    SET 
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}' WHERE 
    movie_id = ${movieId};`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// DELETE MOVIE FROM movie table API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE  
    FROM 
    movie  
    WHERE 
    movie_id =${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// GET DIRECTORS LIST FROM director table API 6

app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `SELECT * FROM director;`;
  const directors = await db.all(getAllDirectorsQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      directorId: dbObject.director_id,
      directorName: dbObject.director_name,
    };
  };
  const directorList = directors.map((d) => convertDbObjectToResponseObject(d));

  response.send(directorList);
});

//GET ALL MOVIES BY DIRECTOR API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const moviesByDirectorQuery = `
    SELECT 
    * 
    FROM 
    movie WHERE director_id=${directorId};`;

  const movies = await db.all(moviesByDirectorQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };
  const moviesList = movies.map((m) => convertDbObjectToResponseObject(m));

  response.send(moviesList);
});
