import { DataTypes } from "sequelize";
import { Pipeline } from "./pipeline";

export class BikewaysPipeline extends Pipeline {
  constructor() {
    super(
      "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/ac87ebfc-d67a-4a63-9528-5474ff33cb68/resource/2af3f58c-562b-4e77-accf-210b6bbf111d/download/bike-network-data-4326.geojson",
      "bikeways",
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        street_name: DataTypes.STRING,
        from_street: DataTypes.STRING,
        to_street: DataTypes.STRING,
        length: DataTypes.FLOAT,
        geometry: DataTypes.GEOMETRY,
      },
      {
        _id: "id",
        STREET_NAME: "street_name",
        FROM_STREET: "from_street",
        TO_STREET: "to_street",
        Shape__Length: "length",
      }
    );
  }
}
