import { DataTypes } from "sequelize";
import { Pipeline } from "./pipeline";

// NOTE THIS IS NOT EVERY INTERSECTION!
export class TrafficPipeline extends Pipeline {
  constructor() {
    super({
      url: "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/traffic-volumes-at-intersections-for-all-modes/resource/df868468-cde9-468e-892d-a1d77dc3a850/download/raw-data-2020-2029.json",
      name: "traffic",
      propertyTypeMap: {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        count_id: DataTypes.INTEGER,
        count_date: DataTypes.DATE,
        location_id: DataTypes.INTEGER,
        latitude: DataTypes.FLOAT,
        centreline_type: DataTypes.INTEGER,
        centreline_id: DataTypes.INTEGER,
        px: DataTypes.INTEGER,
        time_start: DataTypes.DATE,
        time_end: DataTypes.DATE,
        sb_cars_r: DataTypes.INTEGER,
        sb_cars_t: DataTypes.INTEGER,
        sb_cars_l: DataTypes.INTEGER,
        nb_cars_r: DataTypes.INTEGER,
        nb_cars_t: DataTypes.INTEGER,
        nb_cars_l: DataTypes.INTEGER,
        wb_cars_r: DataTypes.INTEGER,
        wb_cars_t: DataTypes.INTEGER,
        wb_cars_l: DataTypes.INTEGER,
        eb_cars_r: DataTypes.INTEGER,
        eb_cars_t: DataTypes.INTEGER,
        eb_cars_l: DataTypes.INTEGER,
        sb_truck_r: DataTypes.INTEGER,
        sb_truck_t: DataTypes.INTEGER,
        sb_truck_l: DataTypes.INTEGER,
        nb_truck_r: DataTypes.INTEGER,
        nb_truck_t: DataTypes.INTEGER,
        nb_truck_l: DataTypes.INTEGER,
        wb_truck_r: DataTypes.INTEGER,
        wb_truck_t: DataTypes.INTEGER,
        wb_truck_l: DataTypes.INTEGER,
        eb_truck_r: DataTypes.INTEGER,
        eb_truck_t: DataTypes.INTEGER,
        eb_truck_l: DataTypes.INTEGER,
        sb_bus_r: DataTypes.INTEGER,
        sb_bus_t: DataTypes.INTEGER,
        sb_bus_l: DataTypes.INTEGER,
        nb_bus_r: DataTypes.INTEGER,
        nb_bus_t: DataTypes.INTEGER,
        nb_bus_l: DataTypes.INTEGER,
        wb_bus_r: DataTypes.INTEGER,
        wb_bus_t: DataTypes.INTEGER,
        wb_bus_l: DataTypes.INTEGER,
        eb_bus_r: DataTypes.INTEGER,
        eb_bus_t: DataTypes.INTEGER,
        eb_bus_l: DataTypes.INTEGER,
        nx_peds: DataTypes.INTEGER,
        sx_peds: DataTypes.INTEGER,
        ex_peds: DataTypes.INTEGER,
        wx_peds: DataTypes.INTEGER,
        nx_bike: DataTypes.INTEGER,
        sx_bike: DataTypes.INTEGER,
        ex_bike: DataTypes.INTEGER,
        wx_bike: DataTypes.INTEGER,
        nx_other: DataTypes.INTEGER,
        sx_other: DataTypes.INTEGER,
        ex_other: DataTypes.INTEGER,
        wx_other: DataTypes.INTEGER,
        geometry: DataTypes.GEOMETRY("POINT", 4326),
      },
    });
  }

  childTransform = () => {
    if (this.extractedDataPaths && this.extractedDataPaths.length > 0) {
      const file = this.extractedDataPaths[0];
      const jsonData = JSON.parse(file.data.toString());
      const transformedData = jsonData.map((row: any) => {
        const newRow = {
          id: row._id,
          geometry: {
            type: "Point",
            coordinates: [row.lng, row.lat],
          },
          ...row,
        };
        delete newRow._id;
        delete newRow.lat;
        delete newRow.lng;
        return newRow;
      });

      this.saveTransformedData({
        features: transformedData,
      });
    }
  };
}
