const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();
app.use(express.static(__dirname + '/public'));

const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;

const db = mysql.createPool({
    host: host,
    user: user,
    password: password,
    database: database
});

// Fonction pour exécuter une requête SQL
async function executeQuery(sql) {
    const connection = await db.getConnection();
    try {
        const [rows, fields] = await connection.query(sql);
    return rows;
    } finally {
        connection.release();
    }
}

// Exécutez vos requêtes SQL et stockez les résultats
const query1 = 'SELECT * FROM Nuitees';
const query2 = 'SELECT * FROM POIs';
const query3 = 'SELECT * FROM POIs';

const queryResults = {
    result1: executeQuery(query1),
    result2: executeQuery(query2),
    result3: executeQuery(query3),
};

app.get('/recuperer-resultat', (req, res) => {
    const queryName = req.query.queryName;
    if (queryResults.hasOwnProperty(queryName)) {
        queryResults[queryName].then(result => {
            res.json(result);
        }).catch(error => {
            res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête' });
        });
    } else {
        res.status(404).json({ error: 'Requête non trouvée' });
    }
});

app.listen(3000, () => {
    console.log('Serveur en cours d\'exécution sur le port 3000');
});