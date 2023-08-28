import { DataTypes } from "sequelize";
import { Pipeline } from "./pipeline";

export class NeighbourhoodsPipeline extends Pipeline {
  constructor() {
    super({
      url: "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/neighbourhoods/resource/1d38e8b7-65a8-4dd0-88b0-ad2ce938126e/download/neighbourhoods-4326.geojson",
      name: "neighbourhoods",
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
