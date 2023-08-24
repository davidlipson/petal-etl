import { clearTempFiles, parseFlag } from "./helpers";
import { db } from "./db";
import {
  AddressesPipeline,
  BikesharesPipeline,
  BikewaysPipeline,
  CentrelinePipeline,
  GreenspacesPipeline,
  NeighbourhoodsPipeline,
  PropertiesPipeline,
  SignalsPipeline,
} from "./pipelines";
import { Pipeline } from "./pipelines/pipeline";
import dotenv from "dotenv";

(async () => {
  dotenv.config();

  console.log("--------- CLEARING TEMP FILES ---------");

  clearTempFiles();

  console.log("--------- DONE CLEARING FILES ---------");

  //const test = parseFlag('test');

  const RUN_EXTRACT = true;
  const RUN_TRANSFORM = true;
  const RUN_LOAD = true;

  const pipelines: Pipeline[] = [
    /*new CentrelinePipeline(),
    new BikesharesPipeline(),
    new AddressesPipeline(),
    new PropertiesPipeline(),
    new GreenspacesPipeline(),
    new NeighbourhoodsPipeline(),*/
    new BikewaysPipeline(),
    new SignalsPipeline(),
  ];

  // download all data sources

  if (RUN_EXTRACT) {
    console.log("--------- RUNNING EXTRACTION ---------");

    for (let i = 0; i < pipelines.length; i++) {
      await pipelines[i].extract();
    }

    console.log("--------- EXTRACTION COMPLETE ---------\n");
  }

  // transform data (validate field names, clean, etc.)
  if (RUN_TRANSFORM) {
    console.log("--------- RUNNING TRANSFORMATION ---------");

    for (let i = 0; i < pipelines.length; i++) {
      await pipelines[i].transform();
    }

    console.log("--------- TRANSFORMATION COMPLETE ---------\n");
  }

  // working when each pipeline is isolated but not altogether...
  // empty tables...?
  // load data into database
  if (RUN_LOAD) {
    console.log("--------- RUNNING LOAD ---------");

    for (let i = 0; i < pipelines.length; i++) {
      await pipelines[i].load();
    }

    console.log("--------- LOAD COMPLETE ---------\n");
  }
})();
