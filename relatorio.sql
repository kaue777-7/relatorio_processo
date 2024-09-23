CREATE DATABASE testedb;

USE testedb;

CREATE TABLE resumo_calculo (
    id INT AUTO_INCREMENT,
    descricao VARCHAR(256) NOT NULL,
    valor DECIMAL(26, 2)  NOT NULL,
    juros DECIMAL(26, 2)  NOT NULL,
    total DECIMAL(26, 2)  NOT NULL,
    reclamante_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (reclamante_id) REFERENCES extractheader(id)
    );

-- ALTER TABLE resumo_calculo ADD COLUMN reclamanteId INT;

CREATE TABLE extractheader (
    id INT PRIMARY KEY,
    Processo VARCHAR(256) NOT NULL,
    Calculo VARCHAR(256) NOT NULL,
    Reclamante VARCHAR(256) NOT NULL,
    Reclamado VARCHAR(256) NOT NULL,
    Periodo_Calculo DATE,
    Data_Ajuizamento DATE,   
    Data_Liquidacao DATE,
    
)
