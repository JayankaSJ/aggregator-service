import "reflect-metadata";
import { DataSource } from "typeorm";
import { Credential } from "@/entities/Credential.entity";
import "./config";

export const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: true,
  entities: [Credential],
  migrations: [__dirname + "/../../migrations/versions/*.{ts,js}"],
  subscribers: [],
});

dataSource
  .initialize()
  .then(async () => {
    console.log("Database connection established!");

    if (process.env.RUN_DATABASE_MIGRATIONS === "true") {
      console.log("Running migrations...");

      await dataSource.runMigrations();
    }
  })
  .catch((error) => {
    console.log(
      "Database connection parameters:" +
        JSON.stringify({
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          username: process.env.DB_USERNAME,
          database: process.env.DB_DATABASE,
        })
    );
    console.log("Error during DataSource initialization:", error);
  });
