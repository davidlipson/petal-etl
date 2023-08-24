import { DataTypes } from "sequelize";
import { Pipeline } from "./pipeline";

export class NeighbourhoodsPipeline extends Pipeline {
  propertyNameMap = {
    _id: "id",
    AREA_NAME: "name",
  };

  propertyTypeMap = {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    geometry: DataTypes.GEOMETRY,
  };

  constructor() {
    super(
      "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/neighbourhoods/resource/1d38e8b7-65a8-4dd0-88b0-ad2ce938126e/download/neighbourhoods-4326.geojson",
      "neighbourhoods"
    );
  }

  load = () => {
    if (this.transformedGeoJsonPath) {
      this.jsonToTable(this.transformedGeoJsonPath);
    }
  };

  childTransform = () => {
    const file = this.extractedDataPaths?.find((file) =>
      file.path.endsWith(".geojson")
    );
    if (file) {
      this.transformGeoJson(file, this.propertyNameMap);
    }
  };
}
