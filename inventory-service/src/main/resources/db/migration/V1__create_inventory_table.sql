CREATE TABLE IF NOT EXISTS inventory (
    product_id BIGINT PRIMARY KEY,
    quantity INT NOT NULL DEFAULT 0,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_inventory_product_id ON inventory(product_id);

INSERT INTO inventory (product_id, quantity, version) VALUES
(1, 100, 0),
(2, 200, 0),
(3, 50, 0),
(4, 75, 0),
(5, 150, 0),
(6, 80, 0),
(7, 30, 0),
(8, 120, 0),
(9, 200, 0),
(10, 60, 0);