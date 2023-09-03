import { parseFlags } from "./helpers";
import { db } from "./db";
import {
  AddressClosestEdgePipeline,
  AddressesPipeline,
  BikeshareClosestEdgePipeline,
  BikesharesPipeline,
  BikewaysPipeline,
  BlocksPipeline,
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
    /* new SignalsPipeline(),
    new TrafficPipeline(),
    new PropertiesPipeline(),
    new GreenspacesPipeline(),
    new NeighbourhoodsPipeline(),
    new BikewaysPipeline(),
    //new CentrelinePipeline(),*/

    // secondary tables

    //new PetalGraphPipeline(),
    /*new ScoresPipeline(),
    new AddressesPipeline(),
    new BikesharesPipeline(),
    new BikeshareClosestEdgePipeline(),
    new AddressClosestEdgePipeline(),*/
    new BlocksPipeline(),
  ];

  const args = parseFlags();
  console.log(`Starting ETL at ${new Date()} with args: `, args);

  // initialize db
  db.query("CREATE EXTENSION IF NOT EXISTS postgis;")
    .then(async () => {
      const etl = new ETL(pipelines);
      await etl.run(args);
      console.log(`Finishing ETL at ${new Date()}.`);
    })
    .catch((err) => {
      console.log(err);
    });
})();
