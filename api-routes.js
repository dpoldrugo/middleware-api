const express = require('express'),
      router = express.Router();

// here list all of API's and modules
utils = require('./api/potres2020/utils.js');
router.post('/potres2020/utils/checkSha256', (req, res) => {
  utils.checkSha256(req, res);
});

//making use of normal routes
// router.get('/**', (req, res) => {
//   res.json({response: 'Home of API root'});
// });

//exporting thee router to other modules
module.exports = router;