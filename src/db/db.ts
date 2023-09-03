import { Sequelize } from "sequelize";
let sql;
console.log("DATABASE_URL", process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  sql = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: false,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  sql = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "petaldev",
    logging: false,
    dialectOptions: {
      ssl: {
        require: false,
        rejectUnauthorized: false,
      },
    },
  });
}

export const db = sql;
