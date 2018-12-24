const express = require('express');
const router = express.Router();
const auth = require('../services/authorizationService');

router.post('/', async (req, res) => {
  try {
    const token = await auth.login(req.body);
    res.send(token)
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;