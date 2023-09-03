import { DataTypes } from "sequelize";
import { Pipeline } from "./pipeline";
import fs from "fs";

export class BikesharesPipeline extends Pipeline {
  constructor() {
    super({
      url: "https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_information",
      name: "bikeshares",
      propertyTypeMap: {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        name: DataTypes.STRING,
        physical_configuration: DataTypes.STRING,
        address: DataTypes.STRING,
        capacity: DataTypes.STRING,
        is_recharging_stations: DataTypes.BOOLEAN,
        rental_methods: DataTypes.ARRAY(DataTypes.STRING),
        geometry: DataTypes.GEOMETRY("POINT", 4326),
        closest_edge_id: {
          type: DataTypes.UUID,
          references: {
            model: "petal",
            key: "id",
          },
        },
      },
    });
  }

  // switch this to standard flow?
  childTransform = () => {
    const path = this.extractedDataPaths?.find((file) =>
      file.endsWith("station_information")
    );
    const file = path ? fs.readFileSync(path) : null;
    if (file) {
      const jsonData = JSON.parse(file.toString());
      const transformedData = jsonData.data.stations.map((station: any) => {
        const newStation = {
          ...station,
          id: station.station_id,
          geometry: {
            type: "Point",
            coordinates: [station.lon, station.lat],
          },
        };
        delete newStation.station_id;
        delete newStation.altitude;
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
}
