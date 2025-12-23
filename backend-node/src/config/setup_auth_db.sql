-- ============================================
-- Script de création de la base de données Suivi VGP
-- À exécuter avec un utilisateur PostgreSQL admin
-- ============================================

-- 1. Créer la base de données dédiée
CREATE DATABASE suivivgp_auth
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TEMPLATE = template0;

-- 2. Créer un utilisateur dédié avec permissions limitées
CREATE USER suivivgp_user WITH ENCRYPTED PASSWORD 'RM_SERVICES_2026';

-- 3. Se connecter à la nouvelle base et configurer les permissions
\c suivivgp_auth

-- 4. Révoquer les permissions par défaut sur le schéma public
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO suivivgp_user;

-- 5. Créer la table users avec sécurité maximale
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- Bcrypt hash (60 caractères)
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE
);

-- 6. Index pour performance et sécurité
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- 7. Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Donner les permissions minimales à l'utilisateur
GRANT SELECT, INSERT, UPDATE ON users TO suivivgp_user;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO suivivgp_user;

-- 9. Commentaires pour documentation
COMMENT ON TABLE users IS 'Table des utilisateurs pour authentification Suivi VGP';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt du mot de passe (12 rounds)';
COMMENT ON COLUMN users.failed_login_attempts IS 'Compteur de tentatives échouées pour protection brute-force';
COMMENT ON COLUMN users.locked_until IS 'Date jusqu à laquelle le compte est verrouillé';

-- ============================================
-- INSTRUCTIONS:
-- 1. Remplacez 'CHANGEZ_CE_MOT_DE_PASSE' par un mot de passe fort
-- 2. Exécutez ce script en tant qu'admin PostgreSQL:
--    psql -h chatbot-postgres -U postgres -f setup_auth_db.sql
-- 3. Mettez à jour votre .env avec:
--    POSTGRES_USER=suivivgp_user
--    POSTGRES_PASSWORD=votre_mot_de_passe
--    POSTGRES_DB=suivivgp_auth
-- ============================================
