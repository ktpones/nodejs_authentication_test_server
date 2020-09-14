module.exports = () => {
  const router = require('express').Router();
  router.use('/auth', require('./authRoute')());
  return router;
};
