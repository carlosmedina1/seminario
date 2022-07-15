const { Pool } = require('pg');

const dataConnection = {
    host: 'localhost',
    user: 'postgres',
    password: '159753',
    database: 'seminario_titulo',
};


const pool = new Pool(dataConnection);

const producto = async (req, res) => {
    try{
        const response = await pool.query('select p.id_producto,p.nombre_producto,p.likes,s.nombre_subcategoria from producto p join subcategoria s on p.id_subcategoria = s.id_subcategoria  where p.vigente=true order by p.likes desc;');
        res.json(response.rows)
    }
    catch(err){
        res.json(err)
    }
}


module.exports = {
    producto,
}