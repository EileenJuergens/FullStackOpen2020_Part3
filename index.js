require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const Person = require('./models/person');


morgan.token('request-body', function (req, res) { 
  return JSON.stringify(req.body)
})

const app = express();

app.use(bodyParser.json())
app.use(cors());
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] :response-time ms :request-body'));


// GET All persons
app.get('/api/persons', (req, res) => {
  Person.find({})
    .then(persons => {
      res.json(persons)
    })
})

// GET Info page
app.get('/info', (req, res) => {
  Person.find({})
    .then(persons => {
      res.send(`
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>
      `)
    })
})

// GET Specific person
app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id)
    .then(person => {
      res.json(person)
    })
})

// DELETE Specific person
app.delete('/api/persons/:id', (req, res) => {
  Person.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(204)
      res.end()
    })
})

// POST New person
app.post('/api/persons', (req, res) => {
  const body = req.body
  // const dobbledName = Person.findOne({ name: body.name })

  if (body.name === undefined || body.number === undefined) {
    res.status(400)
    res.json({ error: 'name or number missing' })
    res.end()
  }

  // if (dobbledName) {
  //   res.status(400)
  //   res.json({ error: 'name must be unique' })
  // }

  else {
    Person.create({
      name: body.name,
      number: body.number
    })
      .then(person => {
        res.json(person.toJSON())
      })
  }
})


const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
