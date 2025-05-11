const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  phone: String,
})

const Person = mongoose.model('Person', personSchema)

// show all persons if only password is given
if (process.argv.length === 3){
  Person.find({}).then(result => {
    console.log('Phonebook:')
    result.forEach(person => {
      console.log(`${person.name} : ${person.phone}`)
    })
    mongoose.connection.close()
  })
}
// if name and number are given, add person
else if (process.argv.length === 5) {
  const name = process.argv[3]
  const phone = process.argv[4]

  const person = new Person({ name, phone })

  person.save().then(() => {
    console.log(`${name}: ${phone}`)
    mongoose.connection.close()
  })
}