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
} from "./pipelines";
import { Pipeline } from "./pipelines/pipeline";
import dotenv from "dotenv";
import { ETL } from "./etl";

(async () => {
  dotenv.config();
  const pipelines: Pipeline[] = [
    /*new CentrelinePipeline(),
    new BikesharesPipeline(),
    new AddressesPipeline(),
    new PropertiesPipeline(),
    new GreenspacesPipeline(),
    new NeighbourhoodsPipeline(),
    new BikewaysPipeline(),
    new SignalsPipeline(),*/
    new PetalGraphPipeline(),
    // add pipelines that have empty functions and only transform for additional tables.
  ];

  const args = parseFlags();
  const etl = new ETL(pipelines);
  await etl.run(args);
})();
