import { DataTypes } from "sequelize";
import { Pipeline } from "./pipeline";

export class GreenspacesPipeline extends Pipeline {
  constructor() {
    super({
      url: "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/9a284a84-b9ff-484b-9e30-82f22c1780b9/resource/7a26629c-b642-4093-b33c-a5a21e4f3d22/download/green-spaces-4326.geojson",
      name: "greenspaces",
      propertyTypeMap: {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        name: DataTypes.STRING,
        geometry: DataTypes.GEOMETRY,
      },
      propertyNameMap: {
        _id: "id",
        AREA_NAME: "name",
      },
    });
  }
}
