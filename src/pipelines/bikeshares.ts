import { DataTypes } from "sequelize";
import { Pipeline } from "./pipeline";

export class BikesharesPipeline extends Pipeline {
  propertyTypeMap = {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    physical_configuration: DataTypes.STRING,
    altitude: DataTypes.FLOAT,
    address: DataTypes.STRING,
    capacity: DataTypes.STRING,
    is_recharging_stations: DataTypes.BOOLEAN,
    rental_methods: DataTypes.ARRAY(DataTypes.STRING),
    longitude: DataTypes.FLOAT,
    latitude: DataTypes.FLOAT,
    geometry: DataTypes.GEOMETRY("POINT", 4326),
  };

  constructor() {
    super(
      "https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_information",
      "bikeshares"
    );
  }

  childTransform = () => {
    const file = this.extractedDataPaths?.find((file) =>
      file.path.endsWith("station_information")
    );
    if (file) {
      const jsonData = JSON.parse(file.data.toString());
      const transformedData = jsonData.data.stations.map((station: any) => {
        const newStation = {
          ...station,
          longitude: station.lon,
          latitude: station.lat,
          id: station.station_id,
          geometry: {
            type: "Point",
            coordinates: [station.lon, station.lat],
          },
        };
        delete newStation.station_id;
        delete newStation.lon;
        delete newStation.lat;
        delete newStation.rental_uris;
        delete newStation.groups;
        delete newStation.nearby_distance;
        delete newStation._ride_code_support;
        delete newStation.obcn;
        return newStation;
      });

      this.saveTransformedData({
        features: transformedData,
      });
    }
  };

  load = () => {
    if (this.transformedGeoJsonPath) {
      this.jsonToTable(this.transformedGeoJsonPath);
    }
  };
}
