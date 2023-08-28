import { Pipeline } from "./pipelines/pipeline";
import { db } from "./db";
import { clearTempFiles } from "./helpers";

export interface runArgs {
  extract: boolean;
  transform: boolean;
  load: boolean;
}

export class ETL {
  pipelines: Pipeline[];
  constructor(pipelines: Pipeline[] = []) {
    this.pipelines = pipelines;
  }

  clearTempFiles = () => {
    console.log("--------- CLEARING TEMP FILES ---------");

    clearTempFiles();

    console.log("--------- DONE CLEARING FILES ---------");
  };

  extract = async () => {
    console.log("--------- RUNNING EXTRACTION ---------");

    for (let i = 0; i < this.pipelines.length; i++) {
      await this.pipelines[i].extract();
    }

    console.log("--------- EXTRACTION COMPLETE ---------\n");
  };

  transform = async () => {
    console.log("--------- RUNNING TRANSFORMATION ---------");

    for (let i = 0; i < this.pipelines.length; i++) {
      await this.pipelines[i].transform();
    }

    console.log("--------- TRANSFORMATION COMPLETE ---------\n");
  };

  load = async () => {
    console.log("--------- RUNNING LOAD ---------");

    for (let i = 0; i < this.pipelines.length; i++) {
      await this.pipelines[i].load();
    }

    console.log("--------- LOAD COMPLETE ---------\n");
  };

  defineModels = async () => {
    console.log("--------- DEFINING MODELS ---------");

    for (let i = 0; i < this.pipelines.length; i++) {
      await this.pipelines[i].defineModal();
    }

    await db.sync({ force: true });

    console.log("--------- MODELS DEFINED ---------\n");
  };

  run = async (args: runArgs) => {
    const { transform, extract, load } = args;
    console.log("--------- STARTING ETL ---------");
    console.log("RUNNING: ", args);
    //this.clearTempFiles();

    if (extract) {
      await this.extract();
    }

    if (transform) {
      await this.transform();
    }

    if (load) {
      await this.defineModels();
      await this.load();
    }
    console.log("--------- ETL COMPLETE ---------\n");
  };
}
