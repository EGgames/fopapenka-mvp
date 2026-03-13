require('dotenv').config({ path: '../.env' });

module.exports = {
  development: {
    username: process.env.DB_USER || 'fopapenka',
    password: process.env.DB_PASSWORD || 'fopapenka_secret',
    database: process.env.DB_NAME || 'fopapenka_dev',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
  },
  test: {
    username: process.env.DB_USER || 'fopapenka',
    password: process.env.DB_PASSWORD || 'fopapenka_secret',
    database: process.env.DB_NAME_TEST || 'fopapenka_test',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
  },
  production: {
    use_env_variable: process.env.DATABASE_URL ? 'DATABASE_URL' : undefined,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    dialectOptions: process.env.DATABASE_URL
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
    logging: false,
  },
};
