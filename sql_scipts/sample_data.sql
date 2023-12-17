-- Використання бази даних
USE db_lecture;

-- Наповнення даними клієнтів в таблицю 'users'
INSERT INTO users (username, email) VALUES
    ('JohnDoe', 'john.doe@gmail.com'),
    ('JaneDoe', 'jane.doe@gmail.com'),
    ('MikeDeSanta', 'mike.desanta@gmail.com'),
    ('StevenWilliamson', 'steven.williamson@gmail.com'),
    ('AnthonyBlackman', 'tony.blackman@example.com');

-- Наповнення даними про замовлення в таблицю 'orders'
INSERT INTO orders (user_id, order_date, amount) VALUES
    (1, '2021-01-15', 150.00),
    (2, '2021-02-20', 200.50),
    (3, '2021-03-22', 99.99),
    (1, '2021-04-25', 300.40),
    (2, '2021-05-30', 155.70),
    (4, '2021-06-15', 180.00),
    (5, '2021-07-20', 210.00),
    (3, '2021-08-25', 130.00);
