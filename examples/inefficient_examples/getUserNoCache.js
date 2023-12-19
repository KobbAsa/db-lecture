const express = require('express');
const mysql = require('mysql');
const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'db_lecture'
});

app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000...');
});