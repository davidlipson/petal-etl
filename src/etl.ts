import { Pipeline } from "./pipelines/pipeline";
import { db } from "./db";
import { clearTempFiles } from "./helpers";

export enum ETLState {
  EXTRACT = "EXTRACT",
  TRANSFORM = "TRANSFORM",
  LOAD = "LOAD",
}

export interface runArgs {
  extract: boolean;
  transform: boolean;
  load: boolean;
}

export interface LoggerArgs {
  progress?: number;
  message?: string;
}

export type LoggerFn = (args?: LoggerArgs) => void;

export class ETL {
  pipelines: Pipeline[];
  state?: ETLState;
  currentPipeline?: Pipeline;

  constructor(pipelines: Pipeline[] = []) {
    this.pipelines = pipelines;
  }

  log = (args?: LoggerArgs) => {
    const progress = args?.progress
      ? ` - ${(args.progress * 100).toFixed(2)}%`
      : "";
    const message = args?.message ? ` - ${args.message.toUpperCase()}` : "";
    let text = "";
    const endMessage = `${message}${progress}`;
    if (this.state && this.currentPipeline) {
      text =
        `----- ${this.state}ING - ${this.currentPipeline.name}${endMessage} ------`.toUpperCase();
    } else if (this.state) {
      text = `----- ${this.state}ING${endMessage} ------`.toUpperCase();
    } else if (this.currentPipeline) {
      text =
        `----- ${this.currentPipeline.name}${endMessage} ------`.toUpperCase();
    }
    if (
      process.stdout.clearLine &&
      process.stdout.cursorTo &&
      process.stdout.write
    ) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`${text}`);
    } else {
      console.log(text);
    }
  };

  setState = (state: ETLState) => {
    this.state = state;
    this.log();
  };

  setPipeline = (pipeline: Pipeline) => {
    this.currentPipeline = pipeline;
    this.log();
  };

  stage = async (state: ETLState) => {
    this.setState(state);
    for (let i = 0; i < this.pipelines.length; i++) {
      const pipeline = this.pipelines[i];
      this.setPipeline(pipeline);
      if (state === ETLState.TRANSFORM) {
        await pipeline.transform();
      } else if (state === ETLState.EXTRACT) {
        await pipeline.extract(this.log);
      } else if (state === ETLState.LOAD) {
        await pipeline.load(this.log);
      }
    }
  };

  defineModels = async () => {
    for (let i = 0; i < this.pipelines.length; i++) {
      await this.pipelines[i].defineModal();
    }

    await db.sync({ force: true });
  };

  run = async (args: runArgs) => {
    const { transform, extract, load } = args;
    clearTempFiles();

    if (extract) {
      await this.stage(ETLState.EXTRACT);
    }

    if (transform) {
      await this.stage(ETLState.TRANSFORM);
    }

    if (load) {
      await this.defineModels();
      await this.stage(ETLState.LOAD);
    }
  };
}
