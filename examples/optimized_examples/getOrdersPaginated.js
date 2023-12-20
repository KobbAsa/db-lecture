const mysql = require('mysql');
const express = require("express");
const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // тут юзернейм
    password: 'password', // тут буде пароль
    database: 'db_lecture' // ім'я бази даних
});

app.get('/all-orders', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 2; // кількість записів на сторінку (у нас загалом 8)
    const offset = (page - 1) * limit;

    db.query('SELECT * FROM orders LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.json(results); // запит отримуємо по посиланню http://localhost:3000/all-orders?page=1 (перші 2), доволі зручно
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000...')
})