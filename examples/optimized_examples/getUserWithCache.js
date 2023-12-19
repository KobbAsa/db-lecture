const express = require('express');
const mysql = require('mysql');
const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'db_lecture'
});

const cache = {}; // об'єкт для зберігання кешованих даних

app.get('/users', (req, res) => {
    if (cache['users']) {
        return res.json(cache['users']); // віддаємо дані з кешу, якщо вони є
    }

    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        cache['users'] = results; // зберігаємо результати у кеш
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000...');
});