const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../model/tourmodel');
const Review = require('../../model/reviewModel');
const User = require('../../model/userModel');

dotenv.config({
  path: './config.env',
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    // console.log(con.connections);
    console.log('DATabse connected');
  });
//READ FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//Sending data to DAtabase
async function importData() {
  try {
    await Tour.create(tours);
    await User.create(users);
    await Review.create(reviews);

    console.log('Data imported');
  } catch (err) {
    console.log(err);
  }
  process.exit();
}
async function deleteData() {
  try {
    await Tour.deleteMany();
    await User.deleteMany();

    await Review.deleteMany();

    console.log('Deleted Data from Database');
  } catch (err) {
    console.log(err);
  }
  process.exit();
}

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
