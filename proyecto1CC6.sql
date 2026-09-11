CREATE DATABASE Entregas_Rapiditas;

CREATE TABLE Clientes (
    Id_cliente SERIAL PRIMARY KEY,
    Nombre VARCHAR(150) NOT NULL,
    Direccion VARCHAR(255) NOT NULL,
    Contrasena VARCHAR(255) NOT NULL
);

CREATE TABLE Destinatario (
    Id_destinatario SERIAL PRIMARY KEY,
    Nombre VARCHAR(150) NOT NULL
);

CREATE TABLE Telefono_Clientes (
    Id_telefono SERIAL PRIMARY KEY,
    Telefono VARCHAR(25) NOT NULL,
    Id_cliente INT NOT NULL REFERENCES Clientes,
    UNIQUE (Id_cliente, Telefono)
);


CREATE TABLE Telefono_Destinatarios (
    Id_telefono SERIAL PRIMARY KEY,
    Telefono VARCHAR(25) NOT NULL,
    Id_destinatario INT NOT NULL REFERENCES Destinatario,
    UNIQUE (Id_destinatario, Telefono)
);

CREATE TABLE Ciudad (
    Codigo VARCHAR(5) PRIMARY KEY,
    Nombre_ciudad VARCHAR(100) NOT NULL,
    CHECK (CHAR_LENGTH(TRIM(Codigo)) = 5)
);

CREATE TABLE Tiendas (
    Id_tienda VARCHAR(50) PRIMARY KEY,
    Nombre VARCHAR(150) NOT NULL
);

CREATE TABLE Estados (
    Id_estado INT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Administradores (
    Id_admin SERIAL PRIMARY KEY,
    Usuario VARCHAR(50) NOT NULL UNIQUE,
    Contrasena VARCHAR(255) NOT NULL
);

CREATE TABLE Tiene_tarifa (
    Codigo_origen VARCHAR(5) NOT NULL REFERENCES Ciudad,
    Codigo_destino VARCHAR(5) NOT NULL REFERENCES Ciudad,
    Precio DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (Codigo_origen, Codigo_destino),
    CHECK (Precio >= 0)
);

CREATE TABLE Ordenes (
    Num_orden SERIAL PRIMARY KEY,
    Num_orden_tienda VARCHAR(50) NULL,
    Fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Direccion_entrega VARCHAR(255) NOT NULL,

    Id_cliente INT NULL REFERENCES Clientes,
    Id_tienda VARCHAR(50) NULL REFERENCES Tiendas,
    Id_destinatario INT NOT NULL REFERENCES Destinatario,
    Id_estado INT NOT NULL DEFAULT 1 REFERENCES Estados,

    Codigo_origen VARCHAR(5) NOT NULL,
    Codigo_destino VARCHAR(5) NOT NULL,
    Costo_envio DECIMAL(10,2) NOT NULL CHECK (Costo_envio >= 0),
	FOREIGN KEY (Codigo_origen, Codigo_destino) REFERENCES Tiene_tarifa(Codigo_origen, Codigo_destino),
    UNIQUE (Id_tienda, Num_orden_tienda),

    CHECK (
        (Id_cliente IS NOT NULL AND Id_tienda IS NULL)
        OR
        (Id_cliente IS NULL AND Id_tienda IS NOT NULL)
    ),

    CHECK (
        (Id_tienda IS NULL AND Num_orden_tienda IS NULL)
        OR
        (
            Id_tienda IS NOT NULL
            AND Num_orden_tienda IS NOT NULL
            AND CHAR_LENGTH(TRIM(Num_orden_tienda)) > 0
        )
    )
);



