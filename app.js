const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;
const logger = require('morgan');
const queryService = require('./services/queryService');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('json spaces', 2);

app.use(logger('dev'));

app.get('/', (req, res) => {
  return res.send({ "error" : false, message: 'Wellcome to the Home Page' })
});

app.get('/persons', async (req, res) => {
  try {
    const queryParams = req.query;
    const data = await queryService.getPersons(queryParams);
    res.send(data)
  } catch (e) {
    console.log(e);
  }
});

app.get('/persons/:id', async (req, res) => {
  try {
    const data = await queryService.getPersonById(req.params.id);
    res.send(data)
  } catch (e) {
    console.log(e);
  }
});

app.post('/persons', async (req, res) => {
  try {
    const data = await queryService.createPerson(req.body);
    res.send(data)
  } catch (e) {
    console.log(e);
  }
});

app.put('/persons/:id', async (req, res) => {
  try {
    const data = await queryService.updatePerson(req.params.id, req.body);
    res.send(data)
  } catch (e) {
    console.log(e);
  }
});

app.delete('/persons/:id', async (req, res) => {
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

app.listen(PORT, console.log(`SERVER STARTED ON PORT ${PORT}`));
