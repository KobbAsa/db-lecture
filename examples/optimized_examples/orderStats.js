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
app.get('/order-stats', (req, res) => {
    // всього один запит, більш читабельно та приємно оку
    let query = `
        SELECT user_id, COUNT(*) as orderCount, SUM(amount) as totalAmount
        FROM orders
        GROUP BY user_id`;

    db.query(query, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000...')
})