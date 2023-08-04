import { useState, useEffect } from 'react'

export const KEY = '3132e678'

export function useMovies(query, callback) {
  const [movies, setMovies] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(
    function () {
      const controller = new AbortController()
      async function fetchMovies() {
        try {
          setError('')
          setIsLoading(true)
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            {
              signal: controller.signal
            }
          )
          if (!res.ok) throw new Error('Something went wrong')
          const data = await res.json()
          if (data.Response === 'False') throw new Error(data.Error)
          setMovies(data.Search)
        } catch (err) {
          if (err.message !== 'The user aborted a request.') {
            setError(err.message)
          }
        } finally {
          setIsLoading(false)
        }
      }
      if (query.length < 3) {
        setMovies([])
        setError('')
        return
      }
      // handleCloseMovie();
      callback?.()
      fetchMovies()

      return () => {
        controller.abort()
      }
    },
    [query]
  )
  return { movies, isLoading, error }
}
