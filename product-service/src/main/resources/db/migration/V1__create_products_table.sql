CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price ON products(price);

INSERT INTO products (name, description, price, category) VALUES
('Laptop Pro 15', 'High-performance laptop with 16GB RAM', 1299.99, 'Electronics'),
('Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 'Electronics'),
('Office Chair', 'Ergonomic office chair with lumbar support', 199.99, 'Furniture'),
('Desk Lamp', 'LED desk lamp with adjustable brightness', 49.99, 'Furniture'),
('Headphones', 'Noise-cancelling wireless headphones', 179.99, 'Electronics'),
('Keyboard', 'Mechanical keyboard with RGB lighting', 89.99, 'Electronics'),
('Monitor 27"', '4K UHD monitor with HDR support', 399.99, 'Electronics'),
('Webcam HD', '1080p HD webcam with microphone', 59.99, 'Electronics'),
('USB Hub', '7-port USB 3.0 hub', 24.99, 'Electronics'),
('Desk Organizer', 'Bamboo desk organizer with compartments', 34.99, 'Furniture');