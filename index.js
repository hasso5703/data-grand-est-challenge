const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();
app.use(express.static(__dirname + '/public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;

// Fonction pour créer un pool de connexions MySQL
const createPool = () => {
    return mysql.createPool({
        host: host,
        user: user,
        password: password,
        database: database
    });
};

let db = createPool();

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

// Ping de la base de données pour vérifier la connexion
const pingDatabase = async () => {
    try {
        const connection = await db.getConnection();
        await connection.ping();
        connection.release();
        return true;
    } catch (error) {
        console.error('Erreur de ping de la base de données:', error.message);
        return false;
    }
};

// Exécutez vos requêtes SQL et stockez les résultats
const query1 = 'SELECT * FROM Nuitees';
const query2 = 'SELECT * FROM POIs';
const query3 = 'SELECT * FROM POIs';

// Exemple de résultats des requêtes
const queryResults = {
    result1: executeQuery(query1),
    result2: executeQuery(query2),
    result3: executeQuery(query3),
};

// WebSocket server logic
wss.on('connection', (ws) => {
    // Envoyer des mises à jour à chaque connexion
    Object.keys(queryResults).forEach(async (queryName) => {
        try {
            const result = await queryResults[queryName];
            ws.send(JSON.stringify({ queryName, result, databaseStatus: 'Connecté' }));
        } catch (error) {
            ws.send(JSON.stringify({ queryName, error: 'Erreur lors de l\'exécution de la requête', databaseStatus: 'Connecté' }));
        }
    });

    // Vérifier la connexion à la base de données à intervalles réguliers
    const pingInterval = setInterval(async () => {
        const isConnected = await pingDatabase();
        ws.send(JSON.stringify({ databaseStatus: isConnected ? 'Connecté' : 'Déconnecté' }));
    }, 5000); // Vérifie toutes les 5 secondes
});

// Route pour récupérer les résultats des requêtes
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

server.listen(3000, () => {
    console.log('Serveur en cours d\'exécution sur le port 3000');
});
