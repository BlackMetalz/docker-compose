CREATE DATABASE kienlt_db;

\c kienlt_db;


CREATE TABLE sample_data (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    salary NUMERIC(10, 2) NOT NULL,
    hire_date DATE NOT NULL
);

INSERT INTO sample_data (name, position, salary, hire_date) VALUES
('John Doe', 'Software Engineer', 75000.00, '2020-01-15'),
('Jane Smith', 'Project Manager', 85000.00, '2019-03-22'),
('Alice Johnson', 'QA Engineer', 65000.00, '2021-06-30'),
('Bob Brown', 'DevOps Engineer', 78000.00, '2018-11-05');