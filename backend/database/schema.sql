-- QueryMind E-Commerce Database Schema for PostgreSQL
-- Run this script to set up the database

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Create customers table
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(50),
    country VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_price DECIMAL(10, 2),
    shipping_city VARCHAR(50),
    shipping_country VARCHAR(50)
);

-- Create order_items table
CREATE TABLE order_items (
    item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL
);

-- Insert sample customers
INSERT INTO customers (first_name, last_name, email, phone, city, country) VALUES
('Alice', 'Johnson', 'alice@example.com', '+1-555-0101', 'New York', 'USA'),
('Bob', 'Smith', 'bob@example.com', '+1-555-0102', 'Los Angeles', 'USA'),
('Carol', 'Williams', 'carol@example.com', '+44-20-7946-0958', 'London', 'UK'),
('David', 'Brown', 'david@example.com', '+91-98765-43210', 'Mumbai', 'India'),
('Emma', 'Davis', 'emma@example.com', '+61-2-9374-4000', 'Sydney', 'Australia'),
('Frank', 'Miller', 'frank@example.com', '+49-30-12345678', 'Berlin', 'Germany'),
('Grace', 'Wilson', 'grace@example.com', '+33-1-23-45-67-89', 'Paris', 'France'),
('Henry', 'Moore', 'henry@example.com', '+1-555-0108', 'Chicago', 'USA'),
('Isabella', 'Taylor', 'isabella@example.com', '+81-3-1234-5678', 'Tokyo', 'Japan'),
('Jack', 'Anderson', 'jack@example.com', '+1-555-0110', 'Houston', 'USA'),
('Karen', 'Thomas', 'karen@example.com', '+91-80000-12345', 'Noida', 'India'),
('Liam', 'Jackson', 'liam@example.com', '+1-555-0112', 'Phoenix', 'USA'),
('Mia', 'White', 'mia@example.com', '+44-161-496-0000', 'Manchester', 'UK'),
('Noah', 'Harris', 'noah@example.com', '+1-555-0114', 'San Antonio', 'USA'),
('Olivia', 'Martin', 'olivia@example.com', '+34-91-123-45-67', 'Madrid', 'Spain'),
('Peter', 'Garcia', 'peter@example.com', '+55-11-91234-5678', 'São Paulo', 'Brazil'),
('Quinn', 'Martinez', 'quinn@example.com', '+52-55-1234-5678', 'Mexico City', 'Mexico'),
('Rachel', 'Robinson', 'rachel@example.com', '+1-555-0118', 'San Diego', 'USA'),
('Samuel', 'Clark', 'samuel@example.com', '+27-11-123-4567', 'Johannesburg', 'South Africa'),
('Tina', 'Rodriguez', 'tina@example.com', '+54-11-1234-5678', 'Buenos Aires', 'Argentina');

-- Insert sample products
INSERT INTO products (product_name, category, price, stock_quantity) VALUES
('iPhone 15 Pro', 'Electronics', 999.99, 150),
('Samsung Galaxy S24', 'Electronics', 849.99, 200),
('Sony WH-1000XM5 Headphones', 'Electronics', 399.99, 75),
('Apple MacBook Pro 14"', 'Electronics', 1999.99, 50),
('Dell XPS 15 Laptop', 'Electronics', 1599.99, 60),
('Nike Air Max 2024', 'Footwear', 129.99, 300),
('Adidas Ultra Boost', 'Footwear', 179.99, 250),
('Levi''s 501 Original Jeans', 'Clothing', 59.99, 400),
('Patagonia Fleece Jacket', 'Clothing', 149.99, 120),
('The Intelligent Investor (Book)', 'Books', 24.99, 500),
('Atomic Habits (Book)', 'Books', 19.99, 600),
('Instant Pot Duo 7-in-1', 'Home & Kitchen', 89.99, 180),
('Dyson V15 Vacuum', 'Home & Kitchen', 749.99, 40),
('Yoga Mat Premium', 'Sports', 45.99, 220),
('Whey Protein 5lb', 'Health', 59.99, 350),
('Coffee Maker Deluxe', 'Home & Kitchen', 79.99, 95),
('Gaming Mouse Pro', 'Electronics', 69.99, 280),
('Mechanical Keyboard', 'Electronics', 129.99, 160),
('Wireless Charger 15W', 'Electronics', 39.99, 400),
('Smart Watch Series 9', 'Electronics', 399.99, 110);

-- Insert sample orders
INSERT INTO orders (customer_id, order_date, status, total_price, shipping_city, shipping_country) VALUES
(1, '2024-01-15 10:30:00', 'delivered', 1399.98, 'New York', 'USA'),
(2, '2024-01-18 14:20:00', 'delivered', 849.99, 'Los Angeles', 'USA'),
(3, '2024-02-01 09:15:00', 'delivered', 399.99, 'London', 'UK'),
(4, '2024-02-10 16:45:00', 'shipped', 2049.98, 'Mumbai', 'India'),
(5, '2024-02-20 11:30:00', 'delivered', 309.98, 'Sydney', 'Australia'),
(6, '2024-03-05 08:00:00', 'processing', 1999.99, 'Berlin', 'Germany'),
(7, '2024-03-12 13:20:00', 'delivered', 179.98, 'Paris', 'France'),
(8, '2024-03-20 10:00:00', 'delivered', 89.99, 'Chicago', 'USA'),
(9, '2024-04-01 15:30:00', 'shipped', 469.98, 'Tokyo', 'Japan'),
(10, '2024-04-05 09:45:00', 'delivered', 149.99, 'Houston', 'USA'),
(11, '2024-04-10 14:00:00', 'delivered', 79.98, 'Noida', 'India'),
(12, '2024-04-15 11:20:00', 'processing', 999.99, 'Phoenix', 'USA'),
(1, '2024-04-20 16:00:00', 'pending', 399.99, 'New York', 'USA'),
(3, '2024-05-01 10:30:00', 'delivered', 1599.99, 'London', 'UK'),
(5, '2024-05-10 13:00:00', 'shipped', 749.99, 'Sydney', 'Australia'),
(2, '2024-05-15 09:00:00', 'delivered', 199.98, 'Los Angeles', 'USA'),
(4, '2024-05-20 14:30:00', 'processing', 129.99, 'Mumbai', 'India'),
(6, '2024-06-01 11:00:00', 'delivered', 69.99, 'Berlin', 'Germany'),
(7, '2024-06-05 15:00:00', 'pending', 459.98, 'Paris', 'France'),
(8, '2024-06-10 10:00:00', 'shipped', 39.99, 'Chicago', 'USA');

-- Insert sample order_items
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 999.99),
(1, 14, 1, 399.99),
(2, 2, 1, 849.99),
(3, 3, 1, 399.99),
(4, 4, 1, 1999.99),
(4, 14, 1, 49.99),
(5, 6, 2, 129.99),
(5, 14, 1, 45.99),
(6, 4, 1, 1999.99),
(7, 7, 1, 179.99),
(8, 12, 1, 89.99),
(9, 3, 1, 399.99),
(9, 19, 1, 69.99),
(10, 9, 1, 149.99),
(11, 10, 1, 24.99),
(11, 11, 1, 19.99),
(12, 1, 1, 999.99),
(13, 3, 1, 399.99),
(14, 5, 1, 1599.99),
(15, 13, 1, 749.99),
(16, 6, 1, 129.99),
(16, 7, 1, 69.99),
(17, 18, 1, 129.99),
(18, 17, 1, 69.99),
(19, 20, 1, 399.99),
(19, 14, 1, 45.99),
(20, 19, 1, 39.99);

-- Verify the data
SELECT 'Customers: ' || COUNT(*) FROM customers
UNION ALL
SELECT 'Products: ' || COUNT(*) FROM products
UNION ALL
SELECT 'Orders: ' || COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items: ' || COUNT(*) FROM order_items;
