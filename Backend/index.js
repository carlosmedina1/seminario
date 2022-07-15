const express = require('express');
const helmet = require('helmet');
const app = express();
const morgan = require('morgan');

app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(express.urlencoded({extended: false}));

app.use(require('./routes/routes'));

app.get('/', (req, res) => {
    res.send("miSupervisor API")
})

app.listen(3000);
console.log('listening on port 3000');