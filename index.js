'use strict';

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const Person = require('./models/person');
const app = express();


morgan.token('request-body',  (req) => JSON.stringify(req.body))

const logger = (req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path:  ', req.path)
  console.log('Body:  ', req.body)
  console.log('---')
  next()
}

app.use(cors());
app.use(express.static('build'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(logger)
app.use(morgan(':method :url :status :res[content-length] :response-time ms :request-body'));


// GET Info page
app.get('/info', (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.send(`
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>
      `)
    })
    .catch(error => next(error))
})

// GET All persons
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.json(persons)
    })
    .catch(error => next(error))
})

// GET Specific person
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404)
        res.end()
      }
    })
    .catch(error => next(error))
})

// DELETE Specific person
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204)
      res.end()
    })
    .catch(error => next(error))
})

// POST New person
app.post('/api/persons', (req, res, next) => {
  const body = req.body
  // const doubledName = Person.findOne({ name: body.name })

  if (body.name === undefined || body.number === undefined) {
    res.status(400)
    res.json({ error: 'name or number missing' })
    res.end()
  }

  // if (doubledName) {
  //   res.status(400)
  //   res.json({ error: 'name must be unique' })
  // }

  else {
    Person.save({
      name: body.name,
      number: body.number
    })
      .then(person => {
        res.json(person.toJSON())
      })
      .catch(error => next(error))
  }
})


// PUT / UPDATE Specific person
app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body;

  const person = {
    number: body.number
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})


// Unknown endpoint
const unknownEndpoint = (req, res) => {
  res.status(404)
  res.send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    res.status(400)
    res.send({ error: 'malformatted id' })
  } 
  else if (error.name === 'ValidationError') {
    res.status(400)
    res.json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
