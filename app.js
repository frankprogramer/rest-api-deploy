const express = require('express')
const app = express()
let movies = require('./movies.json')
const crypto = require('node:crypto')
const cors = require('cors')
const { validateMovie, validarPartialMovie } = require('./movies.js')

app.disable('x-powered-by')

app.use(express.json())

app.use(cors())

app.get('/api/movies', (req, res) => { // recuperar todas las peliculas
  const genero = req.query.genero

  if (genero) {
    const filterMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genero.toLowerCase())
    )
    return res.json(filterMovies)
  }

  res.json(movies)
})

app.get('/api/movies/:id', (req, res) => { // Recuperar movies por id
  const { id } = req.params

  const movie = movies.find(movie => movie.id == id)

  if (movie) {
    res.json(movie)
  } else {
    res.status(404).send('404 Not Found')
  }
})

app.get('/api/movies/year/:year', (req, res) => { // Recuperar movies por year
  const year = req.params.year

  if (year !== undefined) {
    const respuesta = movies.filter(movie => movie.year == year)
    if (respuesta.length > 0) {
      res.json(respuesta)
    } else res.send('no hay resultados ')
  }
  res.status(404).send('404 Not Found')
})

app.get('/api/movies/title/:title', (req, res) => { // Recuperar movies por title
  let title = req.params.title

  if (title !== undefined) {
    title = title.split('+').join(' ')
    console.log(title)
    const respuesta = movies.filter(movie => movie.title.includes(title))
    if (respuesta.length > 0) {
      res.json(respuesta)
    } else res.send('no hay resultados ')
  }
  res.status(404).send('404 Not Found')
})

app.post('/api/movies', (req, res) => { // Agg movie
  const resultado = validateMovie(req.body)

  if (resultado.error) {
    res.status(422).json({ error: JSON.parse(resultado.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...resultado.data
  }

  movies.push(newMovie)
  res.status(201).json(newMovie)
})

app.patch('/api/movies/:id', (req, res) => { // modificar parte de la pelicula
  const result = validarPartialMovie(req.body)

  if (result.error) {
    res.status(422).json({ message: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex < 0) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updateMovies = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovies

  return res.json(updateMovies)
})

app.put('/api/movies/:id', (req, res) => { // Modifiicar por completo una pelicula si existe si no crea una
  const result = validateMovie(req.body)

  if (result.error) return res.status(422).json({ message: JSON.parse(result.error.message) })

  const { id } = req.params

  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex < 0) {
    const newMovie = {
      id: crypto.randomUUID(),
      ...result.data
    }
    movies.push(newMovie)
    res.json({
      message: 'creado exitosamente',
      data: newMovie
    })
  }

  const movieUpdate = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = movieUpdate
  res.json({
    message: 'Modificado exitosamente',
    movieUpdate
  })
})

app.delete('/api/movies/:id', (req, res) => { // Delete a movie
  const { id } = req.params

  const find = movies.find(movie => movie.id === id)

  if (!find) {
    return res.json({ message: 'id of movie not found' })
  }
  const updateLista = movies.filter(movie => movie.id !== id)
  movies = updateLista
  return res.json({ message: 'Movie Eliminada' })
})

app.use('*', (req, res) => {
  res.status(404).json({ message: 'NOT FOUND' })
})
const PORT = process.env.PORT ?? 1234


app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`)
})
