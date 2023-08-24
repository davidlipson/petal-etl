import { Pipeline } from "./pipeline";

export class BikewaysPipeline extends Pipeline {
  constructor() {
    super(
      "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/ac87ebfc-d67a-4a63-9528-5474ff33cb68/resource/d2ec1ab6-abaf-47b1-ace8-36c1696d3376/download/bike-network-data-4326.zip",
      "bikeways"
    );
  }
}
