const express = require('express');
const router = express.Router();
const auth = require('../services/authorizationService');

router.post('/', async (req, res) => {
  try {
    const user = await auth.register(req.body);
    res.send(user)
  } catch (e) {
    res.status(e.code).send(e.message)
  }
});

module.exports = router;