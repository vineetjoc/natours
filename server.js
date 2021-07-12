const dotenv = require('dotenv');
const mongoose = require('mongoose');

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
    console.log('Databse connected');
  });

const app = require('./app');

const port = 3000;
const server = app.listen(port, () => {
  console.log('app started');
});
// process.on('uncaughtException', (err) => {
//   server.close(() => {
//     process.exit();
//   });
// });
process.on('unhandledRejection', (err) => {
  console.log(err.name);
  server.close(() => {
    process.exit(1);
  });
});
