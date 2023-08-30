import { clearTempFiles, parseFlags } from "./helpers";
import { db } from "./db";
import {
  AddressesPipeline,
  BikesharesPipeline,
  BikewaysPipeline,
  CentrelinePipeline,
  GreenspacesPipeline,
  NeighbourhoodsPipeline,
  PetalGraphPipeline,
  PropertiesPipeline,
  SignalsPipeline,
  TTCPipeline,
  TrafficAggPipeline,
  TrafficPipeline,
} from "./pipelines";
import { Pipeline } from "./pipelines/pipeline";
import dotenv from "dotenv";
import { ETL } from "./etl";

(async () => {
  dotenv.config();

  // add flags to select which pipelines to run
  const pipelines: Pipeline[] = [
    /*new SignalsPipeline(),
    new CrossoverPipeline(),
    new CentrelinePipeline(),
    new TrafficPipeline(),
    new BikesharesPipeline(),
    new AddressesPipeline(),
    new PropertiesPipeline(),
    new GreenspacesPipeline(),
    new NeighbourhoodsPipeline(),
    new BikewaysPipeline(),
    // secondary tables
    ,*/
    new PetalGraphPipeline(),
    //new TrafficAggPipeline(),

    // finally, put all weights into final weights table
  ];

  const args = parseFlags();

  // initialize db
  db.query("CREATE EXTENSION IF NOT EXISTS postgis;")
    .then(async () => {
      const etl = new ETL(pipelines);
      await etl.run(args);
    })
    .catch((err) => {
      console.log(err);
    });
})();
