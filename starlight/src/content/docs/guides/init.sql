-- init.sql
-- L'Érablière dorée : structure et données de départ.
-- À exécuter dans la base erabliere (phpMyAdmin, onglet SQL)
-- ou en ligne de commande : mysql -u root erabliere < init.sql
--
-- Attention : le DROP en tête efface la table existante et son contenu.

DROP TABLE IF EXISTS produits;

CREATE TABLE produits (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    nom       VARCHAR(100)  NOT NULL,
    categorie VARCHAR(40)   NOT NULL,
    prix      DECIMAL(6, 2) NOT NULL,
    stock     INT           NOT NULL DEFAULT 0,
    cree_le   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO produits (nom, categorie, prix, stock) VALUES
    ('Sirop d''érable doré 540 ml',  'sirop',      14.50, 12),
    ('Sirop d''érable ambré 540 ml', 'sirop',      15.25,  7),
    ('Beurre d''érable 250 g',       'tartinade',   9.95,  0),
    ('Gelée d''érable 190 ml',       'tartinade',  11.00,  9),
    ('Tire sur la neige',            'confiserie',  6.25, 30),
    ('Coffret découverte',           'coffret',    39.00,  5);
