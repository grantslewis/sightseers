const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

const mongoose = require('mongoose');
require('mongoose-double')(mongoose);

// connect to the database
mongoose.connect('mongodb://localhost:27017/sights', {
  useNewUrlParser: true
});


const mongooseuser = require('mongoose');
// connect to the database
mongooseuser.connect('mongodb://localhost:27017/users', {
  useNewUrlParser: true
});



app.listen(3000, () => console.log('Server listening on port 3000!'));

// Configure multer so that it will upload to '../front-end/public/images'
const multer = require('multer');
const { ObjectID } = require('bson');
const upload = multer({
  dest: '../front-end/public/images/',
  limits: {
    fileSize: 10000000
  }
});

// Create a scheme for items in the museum: a title and a path to an image.
var SchemaTypes = mongoose.Schema.Types;
const sightSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  locationname: String,
  lat: SchemaTypes.Double,
  longi: SchemaTypes.Double,
  userid: String,
  path: String,
});
// userid: mongoose.ObjectID,

const userSchema = new mongooseuser.Schema({
  username: String,
  firstname: String,
  lastname: String,
  age: Number,
  path: String,
});

// sightslogged: Number,

// username: mogoose.ObjectID,

// Create a model for items in the museum.
const Sight = mongoose.model('Sight', sightSchema);

const User = mongooseuser.model('User', userSchema);


// Upload a photo. Uses the multer middleware for the upload and then returns
// the path where the photo is stored in the file system.
app.post('/api/photos', upload.single('photo'), async (req, res) => {
  // Just a safety check
  if (!req.file) {
    return res.sendStatus(400);
  }
  res.send({
    path: "/images/" + req.file.filename
  });
});

// Create a new sight in the database
app.post('/api/sight', async (req, res) => {
  const sight = new Sight({
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    locationname: req.body.location,
    lat: req.body.lat,
    longi: req.body.long,
    userid: req.body.userid,
    path: req.body.path,
  });
  try {
    await sight.save();
    res.send(sight);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Creates a new user
app.post('/api/user', async (req, res) => {
  const user = new User({
    username: req.body.username,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    age: req.body.age,
  });
  try {
    await user.save();
    res.send(user);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Get a list of all of the sights
app.get('/api/sights', async (req, res) => {
  try {
    let sights = await Sight.find();
    res.send(sights);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Get a list of all of the sights added by a user.
app.get('/api/usersights/:userid', async (req, res) => {
  try {
    let sights = await Sight.find({
      userid: req.params.userid
    });
    res.send(sights);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Delete one sight (by id)
app.delete('/api/sight/:id', async (req, res) => {
  try {
    await Sight.deleteOne({
      _id: req.params.id
    });
    let sights = await Sight.find();
    res.send(sights);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Delete a User and their additions
app.delete('/api/user/:id', async (req, res) => {
  try {
    await User.deleteOne({
      _id: req.params.id
    });
    await Sight.deleteMany({
      userid: ObjectID(req.params.id).toString()
    })
    // let items = await Item.find();
    // res.send(items);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Edit a sight
app.put('/api/sight/:id', async (req, res) => {
  try {
    let sight = await Sight.findOne({
      _id: req.params.id
    });
    sight.title = req.body.title;
    sight.description = req.body.description;
    sight.date = req.body.date,
    sight.locationname = req.body.location,
    sight.lat = req.body.lat,
    sight.longi = req.body.long,
    sight.userid = ObjectId(req.body.userid),

    sight.save();

    // Added so that currently selected object is deselected (personal preference)
    let sights = await Sight.find();
    res.send(sights);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});



