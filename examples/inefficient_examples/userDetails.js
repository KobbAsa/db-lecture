const express = require('express');
const mysql = require('mysql');
const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // тут юзернейм
    password: 'password', // тут буде пароль
    database: 'db_lecture' // ім'я бази даних
});

// неоптимізована частина
app.get('/user/:id/with-orders', (req, res) => {
    let userId = req.params.id;

    console.time('QueryTime') // засікаємо час для порівняння

    // у нас тут будуть два окремих запити, не дуже ефективно
    db.query(`SELECT * FROM users WHERE user_id = ${userId}`, (err, userResult) => {
        if (err) throw err;

        db.query(`SELECT * FROM orders WHERE user_id = ${userId}`, (err, ordersResult) => {
            if (err) throw err;

            console.timeEnd('QueryTime')

            res.json({ user: userResult, orders: ordersResult });
        });
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000...')
})