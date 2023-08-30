import { DataTypes } from "sequelize";
import { db } from "../db";
import { Pipeline } from "./pipeline";

// NOTE THIS IS NOT EVERY INTERSECTION!
/*

- weighting buses, trucks, and cars differently since they take up different amounts of space and have different impacts on bikers
- currently just averages, but eventually would want to know direction in each route as dij is calculate
*/

export class TrafficAggPipeline extends Pipeline {
  constructor() {
    super({
      name: "traffic_aggregated",
      propertyTypeMap: {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
        },
        vehicles_per_bike_normalized: DataTypes.FLOAT,
      },
    });
  }

  extract = async () => {};
  transform = () => {};
  load = async () => {
    return new Promise((resolve, reject) => {
      const query = `
      with avgs as 
      (select 
          geometry,
          avg(sb_cars_t + nb_cars_t + eb_cars_t + wb_cars_t) car_average,
          avg(sb_bus_t + nb_bus_t + eb_bus_t + wb_bus_t) bus_average,
          avg(sb_truck_t + nb_truck_t + eb_truck_t + wb_truck_t) truck_average,
          avg(nx_bike + wx_bike + ex_bike + sx_bike) bike_average,
          avg(((sb_cars_t + nb_cars_t + eb_cars_t + wb_cars_t) + (sb_bus_t + nb_bus_t + eb_bus_t + wb_bus_t) + (sb_truck_t + nb_truck_t + eb_truck_t + wb_truck_t)) / nullif(nx_bike + wx_bike + ex_bike + sx_bike, 0)) vehicles_per_bike
      from traffic group by 1),
      traffic_aggregated as (select *, (vehicles_per_bike - min(vehicles_per_bike) OVER ()) / (max(vehicles_per_bike) OVER () - min(vehicles_per_bike) OVER ()) as vehicles_per_bike_normalized from avgs where vehicles_per_bike is not null)
      insert into ${this.name} (id, vehicles_per_bike_normalized)
      select p.id, vehicles_per_bike_normalized from traffic_aggregated ta join petal p on st_intersects(ta.geometry, p.a) group by 1,2
      `;

      // note we're doing a where clause to remove nulls from the table, so this isn't al the intersections in the original table
      // just the ones that have bikes going through

      // vehicles_per_bike is the normalized value of vehicles per bike, so that we can use it in the final calculation

      db.query(query)
        .then((res) => {
          return resolve(res);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  };
}
