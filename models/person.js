/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
require('dotenv').config();
const uniqueValidator = require('mongoose-unique-validator');

const options = {
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useNewUrlParser: true,
};

const url = process.env.MONGODB_URI;

mongoose.connect(url, options)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });


const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  number: {
    type: String,
    required: true,
    minlength: 8,
  },
});

personSchema.plugin(uniqueValidator);

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
