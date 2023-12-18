const express = require('express');
const mysql = require('mysql');
const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // тут юзернейм
    password: 'password', // тут буде пароль
    database: 'db_lecture' // ім'я бази даних
});

// оптимізована частина
app.get('/user/:id/with-orders', (req, res) => {
    let userId = req.params.id;

    console.time('QueryTime') // знову засікаємо час для порівняння

    let query = `
        SELECT users.*, orders.*
        FROM users
        LEFT JOIN orders ON users.user_id = orders.user_id
        WHERE users.user_id = ?`; // використовуємо тут JOIN, більш ефективний підхід і зручний результат

    db.query(query, [userId], (err, result) => {
        if (err) throw err;

        console.timeEnd('QueryTime')

        res.json(result);
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000...')
})