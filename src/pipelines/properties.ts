import { DataTypes } from "sequelize";
import { Pipeline } from "./pipeline";

export class PropertiesPipeline extends Pipeline {
  propertyNameMap = {
    OBJECTID: "id",
    FTYPE: "type",
  };

  // fix these ^ v
  propertyTypeMap = {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    type: DataTypes.STRING,
    geometry: DataTypes.GEOMETRY,
  };

  constructor() {
    super(
      "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/1acaa8b0-f235-4df6-8305-02025ccdeb07/resource/882ec6ce-3e20-409c-a5fd-c7c9018860b3/download/property_boundaries_wgs84_geojson.zip",
      "properties"
    );
  }

  load = () => {
    if (this.transformedGeoJsonPath) {
      this.jsonToTable(this.transformedGeoJsonPath);
    }
  };

  childTransform = () => {
    const file = this.extractedDataPaths?.find((file) =>
      file.path.endsWith("_geojson.json")
    );
    if (file) {
      this.transformGeoJson(file, this.propertyNameMap);
    }
  };
}
