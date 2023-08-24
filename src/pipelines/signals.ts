import { Pipeline } from "./pipeline";

export class SignalsPipeline extends Pipeline {
  constructor() {
    super(
      "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/1a106e88-f734-4179-b3fe-d690a6187a71/resource/2305ef1f-ea25-4440-b607-86f3c4a601ec/download/traffic-signal-4326.zip",
      "signals"
    );
  }
}
