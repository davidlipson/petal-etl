import { DataTypes } from "sequelize";
import { Pipeline } from "./pipeline";

export class SignalsPipeline extends Pipeline {
  constructor() {
    super(
      "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/1a106e88-f734-4179-b3fe-d690a6187a71/resource/68690966-eb29-45ca-99e2-dc9ecf73aee1/download/traffic-beacon-4326.geojson",
      "signals",
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        main_street: DataTypes.STRING,
        midblock_route: DataTypes.STRING,
        side_street_1: DataTypes.STRING,
        side_street_2: DataTypes.STRING,
        private_access: DataTypes.STRING,
        additional_info: DataTypes.STRING,
        geometry: DataTypes.GEOMETRY,
      },
      {
        _id: "id",
        MAIN_STREET: "main_street",
        MIDBLOCK_ROUTE: "midblock_route",
        SIDE1_STREET: "side_street_1",
        SIDE2_STREET: "side_street_2",
        PRIVATE_ACCESS: "private_access",
        ADDITIONAL_INFO: "additional_info",
      }
    );
  }
}
