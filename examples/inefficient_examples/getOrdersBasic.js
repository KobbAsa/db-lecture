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
    db.query('SELECT * FROM orders', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.json(results); // тут ми отримуємо одразу всі замовлення, не ефективно, якщо замовлень дуже багато
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000...')
})