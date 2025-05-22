CREATE TABLE metodos_pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    tipo ENUM('tarjeta', 'pse', 'nequi') NOT NULL,
    detalle JSON NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);