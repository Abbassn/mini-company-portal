CREATE TYPE user_role AS ENUM ('ADMIN', 'HR', 'EMPLOYEE');

CREATE TYPE review_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE companies (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id BIGINT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT users_email_unique UNIQUE (email),

    CONSTRAINT users_company_fk
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE,

    CONSTRAINT users_id_company_unique
        UNIQUE (id, company_id)
);

CREATE TABLE employees (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    base_salary NUMERIC(12, 2) NOT NULL,
    market_midpoint NUMERIC(12, 2) NOT NULL,
    working_days INT NOT NULL,
    absent_days INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT employees_salary_check
        CHECK (base_salary > 0),

    CONSTRAINT employees_market_midpoint_check
        CHECK (market_midpoint > 0),

    CONSTRAINT employees_working_days_check
        CHECK (working_days > 0),

    CONSTRAINT employees_absent_days_check
        CHECK (absent_days >= 0 AND absent_days <= working_days),

    CONSTRAINT employees_company_fk
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE,

    CONSTRAINT employees_user_company_fk
        FOREIGN KEY (user_id, company_id)
        REFERENCES users(id, company_id)
        ON DELETE RESTRICT,

    CONSTRAINT employees_id_company_unique
        UNIQUE (id, company_id)
);

CREATE TABLE salary_reviews (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    old_salary NUMERIC(12, 2) NOT NULL,
    proposed_salary NUMERIC(12, 2) NOT NULL,
    reason TEXT NOT NULL,
    status review_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT salary_reviews_old_salary_check
        CHECK (old_salary > 0),

    CONSTRAINT salary_reviews_proposed_salary_check
        CHECK (proposed_salary > 0),

    CONSTRAINT salary_reviews_company_fk
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE,

    CONSTRAINT salary_reviews_employee_company_fk
        FOREIGN KEY (employee_id, company_id)
        REFERENCES employees(id, company_id)
        ON DELETE CASCADE,

    CONSTRAINT salary_reviews_created_by_company_fk
        FOREIGN KEY (created_by, company_id)
        REFERENCES users(id, company_id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_users_company_id
ON users(company_id);

CREATE INDEX idx_employees_company_id
ON employees(company_id);

CREATE INDEX idx_salary_reviews_company_id
ON salary_reviews(company_id);

CREATE INDEX idx_salary_reviews_employee_id
ON salary_reviews(employee_id);

CREATE INDEX idx_salary_reviews_created_by
ON salary_reviews(created_by);
