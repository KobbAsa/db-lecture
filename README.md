### Підготував: Довженко Антон, ІМ-22

# Оптимізація взаємодії між RESTful API та SQL-базами даних

## Вступ
В сучасному світі розробки програмного забезпечення, ефективність та швидкість веб-сервісів є ключовими факторами для забезпечення високого рівня комфорту
користувачів. Оптимізація взаємодії між RESTful API та SQL-базами даних відіграє важливу роль у досягненні цих цілей. Правильне управління запитами до баз даних 
та їх оптимізація можуть значно підвищити продуктивність та масштабованість веб-додатків.

Ця доповідь присвячена аналізу різних стратегій та підходів до оптимізації роботи з базами даних у контексті RESTful API. Наша увага буде прикута переважно до GET 
запитів. Обираємо цей фокус, оскільки GET запити є найбільш поширеними у веб-додатках для витягування інформації з баз даних, і тому є критичними для 
оптимізації продуктивності. Ми з Вами розглянемо декілька практичних сценаріїв, які демонструють типові виклики та рішення, з якими можуть зіткнутися розробники. 
Від базових технік, таких як використання JOIN операцій та параметризація запитів, до складніших стратегій, таких як кешування та пагінація, ми вивчимо, 
як можна підвищити ефективність взаємодії між вашим API та базою даних.

## Розглянемо декілька сценаріїв
### Перший сценарій: вибірка даних користувача з пов'язаними замовленнями.
Уявимо, що ви хочете отримати список усіх замовлень конкрентного користувача. 

Поглянемо на неоптимізований та оптимізований код.

* Неоптимізований Код: Спочатку видає дані про користувача, а потім окремим запитом видає дані про всі його замовлення. Це
  вимагає двох окремих запитів до бази даних, що може бути менш ефективним у термінах продуктивності (особливо з великим обсягом).

``` js 
app.get('/user/:id/with-orders', (req, res) => {
    let userId = req.params.id;

    // у нас тут будуть два окремих запити, не дуже ефективно
    db.query(`SELECT * FROM users WHERE user_id = ${userId}`, (err, userResult) => {
        if (err) throw err;

        db.query(`SELECT * FROM orders WHERE user_id = ${userId}`, (err, ordersResult) => {
            if (err) throw err;

            res.json({ user: userResult, orders: ordersResult });
        });
    });
});
```

* Оптимізований Код: Використовує один SQL запит з JOIN, щоб отримати всю необхідну інформацію. Це зменшує кількість запитів до 
бази даних та покращує час відгуку.

``` js 
app.get('/user/:id/with-orders', (req, res) => {
    let userId = req.params.id;

    let query = `
        SELECT users.*, orders.*
        FROM users
        LEFT JOIN orders ON users.user_id = orders.user_id
        WHERE users.user_id = ?`; 
    // використовуємо тут JOIN, більш ефективний підхід і зручний результат
    
    db.query(query, [userId], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});
```

У нашому оптимізованому сценарії, ми використовуємо SQL JOIN, який дозволяє об'єднувати дані з різних таблиць в одному запиті.
Використання JOIN є ключовим для зменшення кількості окремих запитів до бази даних, тим самим підвищуючи ефективність та 
скорочуючи час відповіді сервера. Наприклад, у нашому випадку, використання LEFT JOIN дозволяє одночасно отримати інформацію про 
користувача та його замовлення, тим самим забезпечуючи більш швидке та ефективне отримання повної інформації про користувача та 
його діяльність в одному запиті.

### Другий сценарій: агрегація даних про замовлення.
Уявімо, що нашому API потрібно надати статистику по замовленням користувачів. Ми хочемо отримати загальну кількість замовлень 
та загальну суму замовлень для кожного користувача.

* Неоптимізований Код: У неоптимізованому коді ми можемо отримувати дані для кожного користувача окремо, що призводить до великої кількості
запитів до бази даних.

``` js
app.get('/order-stats', (req, res) => {
    db.query('SELECT user_id FROM users', (err, users) => {
        if (err) throw err;

        let stats = [];
        
        users.forEach(user => { // тут у нас цикл і купа запитів, до того ж код некрасивий і не дуже читабельний
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
```

* Оптимізований Код: В оптимізованому варіанті ми можемо використовувати групування та агрегатні функції SQL для отримання всієї необхідної інформації 
одним запитом.

``` js
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
```

В цьому сценарії оптимізація полягає у зменшенні кількості запитів до бази даних та використанні ефективних SQL операцій. Групування (GROUP BY)
та агрегатні функції (COUNT, SUM) дозволяють обробляти дані безпосередньо на рівні бази даних, що підвищує продуктивність та знижує навантаження на сервер.

Цей приклад показує, як оптимізація може бути застосована для підвищення ефективності обробки даних.

Ну і варто зазначити, що при збільшені кількості користувачів і замовлень неоптимізований приклад буде все більше неефективним.

### Третій сценарій: Оптимізація з використанням кешування
У цьому сценарії ми розглянемо, як кешування часто запитуваних даних може значно покращити продуктивність API, зменшуючи кількість звернень до бази даних.

* Неоптимізований Код: Цей код кожного разу виконуватиме запит до бази даних при кожному зверненні до API.

``` js
app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});
```

* Оптимізований Код: Цей код використовує простий кеш для збереження даних, які були отримані з бази даних. 
При наступних зверненнях до API спочатку перевіряється кеш.

``` js
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
```

### Четвертий сценарій: оптимізація запитів за допомогою параметризації

* Неоптимізований Код: У цьому коді дані користувача вставляються безпосередньо в SQL запит, що підриває безпеку иа створює ризик SQL-ін'єкцій.

``` js
app.get('/search-users', (req, res) => {
    const searchTerm = req.query.term;
    const query = `SELECT * FROM users WHERE username LIKE '%${searchTerm}%'`; // тут використовуємо змінну напряму, не дуже безпечно

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});
```

* Оптимізований Код: У оптимізованому коді використовується параметризація, яка не тільки покращує безпеку, але й дозволяє базі даних оптимізувати 
виконання запитів.

``` js
app.get('/search-users', (req, res) => {
    const searchTerm = req.query.term;
    const query = `SELECT * FROM users WHERE username LIKE ?`; // використовуємо параметризацію

    db.query(query, [`%${searchTerm}%`], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});
```

У цьому коді, замість вставки searchTerm безпосередньо в SQL запит, використовується плейсхолдер ?, а саме значення передається як другий аргумент методу query. 
Це запобігає вставці шкідливого коду через вхід користувача та дозволяє базі даних ефективно використовувати попередньо скомпільовані плани запитів.

Параметризація запитів є ключовим аспектом при розробці безпечних та ефективних веб-додатків. Вона допомагає уникнути SQL-ін'єкцій, однієї з найпоширеніших 
вразливостей веб-додатків. Крім того, параметризація може покращити продуктивність, оскільки база даних може оптимізувати виконання запитів, використовуючи 
кешування планів виконання для параметризованих запитів.

### П'ятий сценарій: оптимізація запитів за допомогою обмеження результатів

* Неоптимізований Код: У цьому прикладі коду запит до бази даних витягує всі записи з таблиці, що може бути неефективним та викликати проблеми з продуктивністю 
при великій кількості даних.

``` js
app.get('/all-orders', (req, res) => {
    db.query('SELECT * FROM orders', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.json(results); // тут ми отримуємо одразу всі замовлення, не ефективно, якщо замовлень дуже багато
    });
});

```

* Оптимізований Код: В оптимізованій версії запит обмежує кількість даних, що повертаються, використовуючи LIMIT та OFFSET. 
Це забезпечує пагінацію та зменшує навантаження на сервер. Ми можемо виводити зручно відповідь, перемикаючись між сторінками.

``` js
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
```

Цей сценарій демонструє важливість обмеження кількості даних, що повертаються у відповіді. Використання LIMIT і OFFSET дозволяє реалізувати пагінацію, яка є 
ключовою для оптимізації API, особливо коли потрібно обробляти великі набори даних. Це не тільки підвищує продуктивність, але й покращує загальний досвід
користувача, оскільки дозволяє швидше отримати доступ до даних та зменшує час завантаження.

## Висновки
Отже, ця доповідь демонструє важливість оптимізації взаємодії між RESTful API та SQL-базами даних. Через різноманітні сценарії, ми побачили, як різні підходи до 
оптимізації можуть значно покращити продуктивність та ефективність запитів. Від використання JOIN операцій для зменшення кількості запитів до бази даних до впровадження
кешування та пагінації для зниження навантаження на сервер, кожен приклад виявився корисним у різних контекстах.

Оптимізація баз даних є критично важливою, особливо в умовах великих обсягів даних та вимог до швидкодії. Правильне управління запитами не тільки покращує час відповіді 
сервера, але й забезпечує стабільність та масштабованість веб-додатків. Це необхідно для забезпечення позитивного користувацького досвіду, особливо у світі, де швидкість та 
ефективність є ключовими чинниками успіху.

Узагальнюючи, ми можемо сказати, що оптимізація RESTful API та взаємодії з SQL-базами даних вимагає глибокого розуміння як технічних деталей, так і бізнес-потреб. 
Застосування найкращих практик та постійне вдосконалення архітектури системи є ключами до створення високопродуктивних та надійних веб-додатків.


## Інструкції по запуску прикладів

Ці інструкції допоможуть вам налаштувати та запустити приклади оптимізації, описані у цій доповіді. Для цього вам знадобляться Node.js, npm, середовище розробки 
(IDE), а також MySQL та MySQL Workbench для бази даних. POSTMAN або аналогічний інструмент буде корисним для тестування API (опціонально).

### Крок 1: Налаштування проекту

1. **Клонуйте репозиторій на ваш локальний комп'ютер:**
   ```bash
   git clone https://github.com/KobbAsa/db-lecture.git
   ```
2. **Перейдіть до каталогу проекту та встановіть залежності:**
   ```bash
   cd db-lecture
   npm install
   ```
### Крок 2: Налаштування бази даних
   Відкрийте MySQL Workbench та створіть нову базу даних за допомогою SQL-скриптів, які є у репозиторії. Це надасть вам примітивну базу даних для тестування прикладів.

### Крок 3: Запуск прикладів

1. **Виберіть каталог з неоптимізованими або оптимізованими прикладами для тестування:**
   ```bash
   cd examples/inefficient_examples
   ```
   **або**
   ```bash
   cd examples/optimized_examples
   ```

2. Запустіть обраний вами приклад за допомогою Node.js:
   ```bash
   node getOrdersPaginated.js
   ```

3. Тепер ви можете **тестувати API**, використовуючи **Postman**, браузер або інші інструменти для відправки HTTP запитів.

4. Також можете [переглянути іллюстрації](/docs/img) тестування і порівняння прикладів у каталозі [/docs/img](/docs/img), де показано тестування деяких прикладів з лекції.

***Примітка: Переконайтеся, що ваш локальний сервер MySQL запущений (можна перевірити в диспетчері задач, служби) і налаштований відповідно до конфігурації,
використаної у прикладах коду (не забудьте змінити пароль на свій).***