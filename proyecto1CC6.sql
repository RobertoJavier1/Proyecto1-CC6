CREATE TABLE Destinos (
	Codigo CHAR(5) PRIMARY KEY,
	Nombre_ciudad VARCHAR(100) NOT NULL,
	Costo_envio DECIMAL(10,2) NOT NULL
)

CREATE TABLE Estados(
	Id_estado INT PRIMARY KEY,
	Nombre VARCHAR(100) NOT NULL
)

CREATE TABLE Ordenes(
	Num_orden VARCHAR(100) PRIMARY KEY,
	Tienda VARCHAR(100) NOT NULL,
	Destinatario VARCHAR(100) NOT NULL,
	Direccion_entrega VARCHAR(200) NOT NULL,
	Fecha_creacion DATE NOT NULL,
	Codigo_destino CHAR(5) NOT NULL REFERENCES Destinos,
	Id_estado INT NOT NULL REFERENCES Estados
)