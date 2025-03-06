require('dotenv').config() // it's important that dotenv gets imported before the note model
const express = require('express')
const app = express()

const Person = require('./models/person')

let persons = [
]

app.use(express.static('dist'))


const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError'){
    return response.status(400).send({error: 'malformatted id'})
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  }

  next(error)
}

const cors = require('cors')

app.use(cors())

app.use(express.json())
app.use(requestLogger)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.phone) {
    return response.status(400).json({ error: 'content missing' })
  }

  Person.findOne({name : body.name})
    .then(existingPerson => {
      if (existingPerson) {
        // if a person exists, update their phone number with the one provided in the request 
        existingPerson.phone = body.phone 
        return existingPerson.save()
          .then(updatedPerson => response.json(updatedPerson))
          .catch(error => next(error))
      } else {
        // if no person exists, create a new one 
        const person = new Person({
          name: body.name,
          phone: body.phone,
        })

        person.save()
          .then(savedPerson => {
            response.json(savedPerson)
          })
          .catch(error => next(error))
      }
    })  
  })
  
  app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
      .then(person => {
        if (!person){
          return response.status(404).json({error: 'Person not found'})
        }
        response.json(person)
      })
      .catch(error => next(error))
  })
  
  app.get('/info', (request, response) => {
    Person.countDocuments({})
      .then(count => {
        response.send(
          `<p>Phonebook has info for ${count} people </p>
            <p>${new Date()}</p>`
        )
      })
      .catch(error => {
        console.error('Error fetching count:', error)
        response.status(500).send({error: 'Internal Server Error'})
      })
  })
  
  app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })
  
  app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body 
  
    // Validate the phone number format
    const phoneRegex = /^(\d{2}|\d{3})-\d{7,8}$/;
      if (!phoneRegex.test(body.phone)) {
      return response.status(400).json({ error: 'Invalid phone number format. Use format XX-XXXXXXX or XXX-XXXXXXX.' })
    }

    const person = {
      name: body.name,
      phone: body.phone, // use the phone number provided in the request (only add it if it's valid)
    }
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
  })
  
  app.use(unknownEndpoint)
  
  app.use(errorHandler)
  
  const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })