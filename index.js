const express = require('express')
const app = express()

app.use(express.json())


app.get('/api/info', (request, response) => {
  const time = new Date()
  response.send(`
    <p>Phonebook has info for 2 people</p>
    <p>${time}</p>
    `)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


