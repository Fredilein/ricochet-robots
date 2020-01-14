const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
 
const games = require('./db/games');



const app = express();
 
app.use(morgan('tiny'));
app.use(cors());
app.use(bodyParser.json());
 
app.get('/', (req, res) => {
    res.json({
        message: 'Behold The MEVN Stack!'
    });
});

app.get('/games', (req, res) => {
    games.getAll().then((games) => {
        res.json(games);
    });
});

app.post('/games', (req, res) => {
    console.log(req.body);
    games.create(req.body).then((game) => {
        res.json(game);
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
});
 
const port = process.env.PORT || 4001;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});
