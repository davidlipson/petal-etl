import { Options, Sequelize } from "sequelize";
const basicSettings: Options = {
  logging: false,
  dialect: "postgres",
};
let sql;
console.log("DATABASE_URL", process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  sql = new Sequelize(process.env.DATABASE_URL, {
    ...basicSettings,
    dialectOptions: {
      ssl: {
        require: false,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  sql = new Sequelize({
    ...basicSettings,
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "petaldev",
  });
}

export const db = sql;
