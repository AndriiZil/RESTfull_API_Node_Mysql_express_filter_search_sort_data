const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const logger = require('morgan');
const PORT = process.env.PORT || 8080;

const authentication = require('./routes/auth');
const registration = require('./routes/register');

const queryService = require('./services/queryService');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('json spaces', 2);

app.use(logger('dev'));

app.use('/api/login', authentication);
app.use('/api/register', registration);

app.use((req, res, next) => {
  const token = req.headers['Authorization'];
  if (token) {
    const secret = process.env.SECRET_KEY;
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
});

app.get('/', (req, res) => {
  return res.send({ "error" : false, message: 'Wellcome to the Home Page' })
});

app.get('/api/persons', async (req, res) => {
  try {
    const data = await queryService.getPersons(req.query);
    res.send(data)
  } catch (e) {
    console.log(e);
  }
});

app.get('/api/persons/:id', async (req, res) => {
  try {
    const data = await queryService.getPersonById(req.params.id);
    res.send(data)
  } catch (e) {
    console.log(e);
  }
});

app.post('/api/persons', async (req, res) => {
  try {
    const data = await queryService.createPerson(req.body);
    res.send(data)
  } catch (e) {
    console.log(e);
  }
});

app.put('/api/persons/:id', async (req, res) => {
  try {
    const data = await queryService.updatePerson(req.params.id, req.body);
    res.send(data)
  } catch (e) {
    console.log(e);
  }
});

app.delete('/api/persons/:id', async (req, res) => {
  try {
    const data = await queryService.deletePerson(req.params.id);
    res.send(data)
  } catch (e) {
    console.log(e);
  }
});

app.all('*', (req, res, next) => {
  return res.status(404).send('Page is not found');
  next();
});

app.listen(PORT, () => console.log(`SERVER STARTED ON PORT ${PORT}`));
