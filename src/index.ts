import { parseFlags } from "./helpers";
import { db } from "./db";
import {
  AddressClosestEdgePipeline,
  AddressesPipeline,
  BikeshareClosestEdgePipeline,
  BikesharesPipeline,
  BikewaysPipeline,
  CentrelinePipeline,
  GreenspacesPipeline,
  NeighbourhoodsPipeline,
  PetalGraphPipeline,
  PropertiesPipeline,
  ScoresPipeline,
  SignalsPipeline,
  TrafficPipeline,
} from "./pipelines";
import { Pipeline } from "./pipelines/pipeline";
import { ETL } from "./etl";

(async () => {
  // add flags to select which pipelines to run
  const pipelines: Pipeline[] = [
    new SignalsPipeline(),
    new CentrelinePipeline(),
    new TrafficPipeline(),
    new PropertiesPipeline(),
    new GreenspacesPipeline(),
    new NeighbourhoodsPipeline(),
    new BikewaysPipeline(),

    // secondary tables

    new PetalGraphPipeline(),
    new ScoresPipeline(),
    new AddressesPipeline(),
    new BikesharesPipeline(),
    new BikeshareClosestEdgePipeline(),
    new AddressClosestEdgePipeline(),
  ];

  const args = parseFlags();
  console.log(`Starting ETL at ${new Date()} with args: `, args);

  // initialize db
  db.query("CREATE EXTENSION IF NOT EXISTS postgis;")
    .then(async () => {
      db.query(`CREATE DATABASE IF NOT EXISTS petaldb`)
        .then(async () => {
          db.query(`USE petaldb;`)
            .then(async () => {
              console.log("Connected to database.");
              const etl = new ETL(pipelines);
              await etl.run(args);
              console.log(`Finishing ETL at ${new Date()}.`);
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
})();
