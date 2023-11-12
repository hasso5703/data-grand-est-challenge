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
const query3 = 'SELECT type, count(*) as nombre FROM Nuitees group by type;';
const query4 = 'SELECT sstype, count(*) as nombre FROM POIs group by sstype;';

const queryResults = {
    result1: executeQuery(query1),
    result2: executeQuery(query2),
    result3: executeQuery(query3),
    result4: executeQuery(query4),
};

let i = 0;
// Envoyer l'état de la connexion toutes les 5 secondes
setInterval(() => {
    db.query('SELECT 1')
        .then(() => {
            if (i<1){
                console.log('Connexion à la base de données établie');
                i+=1;
            }
            // Envoyer un événement SSE aux clients connectés pour indiquer une connexion réussie
            app.emit('databaseStatus', 'connected');
        })
        .catch((err) => {
            console.error('Erreur de connexion à la base de données', err);
            // Envoyer un événement SSE aux clients connectés pour indiquer une erreur de connexion
            app.emit('databaseStatus', 'disconnected');
        });
}, 3000);

// Endpoint SSE pour obtenir l'état de la connexion en temps réel
app.get('/database-status', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Envoyer l'état actuel de la connexion immédiatement lorsqu'un client se connecte
    if (db.isInitialized) {
        res.write(`data: ${db.isDisconnected ? 'disconnected' : 'connected'}\n\n`);
    }

    // Écouter les événements SSE émis par l'application
    const listener = (status) => {
        res.write(`data: ${status}\n\n`);
    };
    app.on('databaseStatus', listener);

    // Gérer la déconnexion du client
    req.on('close', () => {
        app.removeListener('databaseStatus', listener);
    });
});

app.listen(3000, () => {
    console.log('Serveur en cours d\'exécution sur le port 3000');
});

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

