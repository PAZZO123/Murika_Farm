const dotenv = require('dotenv');
dotenv.config();

const databaseUri = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return process.env.MONGO_PROD_DB;
    case 'test':
      return process.env.MONGO_TEST_DB;
    default:
      return process.env.MONGO_URI;
  }
};

module.exports = {
  secret: process.env.SESSION_SECRET || 'df390ee03b7f31fc0bdebf77562726c1f34c9e153c1fbb61ddb6d50f1b0f67c6',
  database: databaseUri(),
};
