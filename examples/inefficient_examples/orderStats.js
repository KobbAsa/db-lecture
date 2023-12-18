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
app.get('/order-stats', (req, res) => {
    db.query('SELECT user_id FROM users', (err, users) => {
        if (err) throw err;
        let stats = [];
        users.forEach(user => { // тут у нас цикл і купа запитів (ще й асинхронних), до того ж код некрасивий і не дуже читабельний
            db.query(`SELECT COUNT(*) as orderCount, SUM(amount) as totalAmount FROM orders WHERE user_id = ${user.user_id}`, (err, result) => {
                if (err) throw err;
                stats.push({ user: user.user_id, ...result[0] });
                if (stats.length === users.length) {
                    res.json(stats);
                }
            });
        });
    });
});

app.listen(3000, () => {
    console.log('Server (OrderStats ineff) is running on port 3000...')
})