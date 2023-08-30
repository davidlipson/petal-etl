import { DataTypes } from "sequelize";
import { Pipeline } from "./pipeline";

export class CrossoverPipeline extends Pipeline {
  constructor() {
    super({
      url: "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/1a106e88-f734-4179-b3fe-d690a6187a71/resource/414b8e5f-9f73-4ece-a8dc-a6f74d25662d/download/pedestrian-crossover-4326.geojson",
      name: "crossovers",
    });
  }
}
