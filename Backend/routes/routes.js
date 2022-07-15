const {Router} = require('express');
const router = Router();

const {  producto } = require('../controller/sync')


router.post('/seminario/sync/producto', producto);


module.exports = router;
