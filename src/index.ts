import { clearTempFiles, parseFlags } from "./helpers";
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
  TTCPipeline,
  TrafficPipeline,
} from "./pipelines";
import { Pipeline } from "./pipelines/pipeline";
import dotenv from "dotenv";
import { ETL } from "./etl";

(async () => {
  dotenv.config();

  // add flags to select which pipelines to run
  const pipelines: Pipeline[] = [
    /* new SignalsPipeline(),
    new CentrelinePipeline(),
    new TrafficPipeline(),
    
    
    new PropertiesPipeline(),
    new GreenspacesPipeline(),
    new NeighbourhoodsPipeline(),
    new BikewaysPipeline(),*/

    // secondary tables

    // new PetalGraphPipeline(),
    new ScoresPipeline(),
    // new AddressesPipeline(),
    //new BikesharesPipeline(),
    //new BikeshareClosestEdgePipeline(),
    //new AddressClosestEdgePipeline(),

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
