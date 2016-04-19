var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/users', function(req, res, next) {
  console.log("does something with users");
  next();
});

module.exports = router;
