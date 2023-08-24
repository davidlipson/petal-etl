import { Pipeline } from "./pipeline";

export class CentrelinePipeline extends Pipeline {
  constructor() {
    super(
      "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/1d079757-377b-4564-82df-eb5638583bfb/resource/d86bdca4-ab2c-470d-80fb-34647ea0e87f/download/centreline-version-2-4326.zip",
      "centreline"
    );
  }
}
