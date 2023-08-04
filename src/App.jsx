/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react'
import StarRating from './StarRating'
import { useMovies, KEY } from './useMovies'
import { useKey } from './useKey'
import { useLocalStorageState } from './useLocalStorageState'

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0)

export default function App() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const { movies, isLoading, error } = useMovies(query, handleCloseMovie)

  const [watched, setWatched] = useLocalStorageState([], 'watched')

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id))
  }

  function handleCloseMovie() {
    setSelectedId(null)
  }

  function handleAddWatchedMovie(movie) {
    setWatched((watched) => [...watched, movie])
  }

  function handleDeleteWatchedMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id))
  }

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onSelectedId={setSelectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatchedMovie={handleAddWatchedMovie}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatchedMovie={handleDeleteWatchedMovie}
                onSelectedId={setSelectedId}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  )
}

function NavBar({ children }) {
  return (
    <nav className='nav-bar'>
      <Logo />
      {children}
    </nav>
  )
}

function Logo() {
  return (
    <div className='logo'>
      <span role='img'>🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null)

  useEffect(
    function () {
      function callback(e) {
        if (e.code === 'Enter') {
          if (document.activeElement === inputEl.current) return
          inputEl.current.focus()
          setQuery('')
        }
      }

      document.addEventListener('keydown', callback)
      return () => document.addEventListener('keydown', callback)
    },
    [setQuery]
  )
  return (
    <input
      className='search'
      type='text'
      placeholder='Search movies...'
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  )
}

function NumResults({ movies }) {
  return (
    <p className='num-results'>
      Found <strong>{movies ? movies.length : 0}</strong> results
    </p>
  )
}

function Main({ children }) {
  return <main className='main'>{children}</main>
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className='box'>
      <button className='btn-toggle' onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? '–' : '+'}
      </button>
      {isOpen && children}
    </div>
  )
}

function Loader() {
  return <p className='loader'>Loading ...</p>
}

function ErrorMessage({ message }) {
  return (
    <p className='error'>
      <span>⛔️ </span>
      {message}
    </p>
  )
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className='list list-movies'>
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  )
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating))
  const avgUserRating = average(watched.map((movie) => movie.userRating))
  const avgRuntime = average(watched.map((movie) => movie.runtime))
  return (
    <div className='summary'>
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchedMoviesList({ watched, onDeleteWatchedMovie, onSelectedId }) {
  return (
    <ul className='list'>
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatchedMovie={onDeleteWatchedMovie}
          onSelectedId={onSelectedId}
        />
      ))}
    </ul>
  )
}

function WatchedMovie({ movie, onDeleteWatchedMovie, onSelectedId }) {
  function handleDelete(e) {
    e.stopPropagation()
    onDeleteWatchedMovie(movie.imdbID)
  }
  return (
    <li onClick={() => onSelectedId(movie.imdbID)}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime}</span>
        </p>

        <button className='btn-delete' onClick={handleDelete}>
          X
        </button>
      </div>
    </li>
  )
}

function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatchedMovie,
  onSelectedId,
  watched
}) {
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [userRating, setUserRating] = useState('')

  const countRef = useRef(0)

  useEffect(
    function () {
      if (userRating) countRef.current++
    },
    [userRating]
  )

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId)
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating

  const {
    Title: title,
    Year: year,
    Released: released,
    Runtime: runtime,
    Poster: poster,
    imdbRating,
    Plot: plot,
    Actors: actors,
    Director: director,
    Genre: genre
  } = movie

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      runtime: Number(runtime.split(' ').at(0)),
      imdbRating,
      userRating,
      countRatingDecisions: countRef.current
    }
    onAddWatchedMovie(newWatchedMovie)
    onSelectedId(null)
  }

  useKey('Escape', onCloseMovie)

  useEffect(
    function () {
      setIsLoading(true)
      async function getMovieDetails() {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        )
        const data = await res.json()
        setMovie(data)
        setIsLoading(false)
      }
      getMovieDetails()
    },
    [selectedId]
  )

  useEffect(
    function () {
      if (!title) return
      document.title = `Movie: ${title}`
      return () => {
        document.title = 'usePopcorn'
      }
    },
    [title]
  )

  return (
    <div className='details'>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className='btn-back' onClick={onCloseMovie}>
              ←
            </button>
            <img src={poster} alt={`Poster of ${title}`} />
            <div className='details-overview'>
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {movie.imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className='rating'>
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className='btn-add' onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated movie with{' '}
                  {watchedUserRating > 1
                    ? `${watchedUserRating} stars`
                    : `${watchedUserRating} star`}{' '}
                  <span>⭐️</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  )
}
