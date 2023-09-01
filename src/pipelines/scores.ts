import { DataTypes } from "sequelize";
import { db } from "../db";
import { Pipeline } from "./pipeline";
import { LoggerFn } from "../etl";

/*

- what if it goes the wrong way on the road? then it's useless
- need direction!
*/

// scores
// [-1,1] normalized values
// -1 = most safe, 1 = least safe

export class ScoresPipeline extends Pipeline {
  constructor() {
    super({
      name: "scores",
      propertyTypeMap: {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          references: {
            model: "petal",
            key: "id",
          },
        },
        bikeway_score: DataTypes.FLOAT,
        traffic_score: DataTypes.FLOAT,
        fcode_traffic_score: DataTypes.FLOAT,

        // hardcoded final scores for dijkstra for basic modes
        // if we want to customize this, it needs to happen on frontend
        fast_score: DataTypes.FLOAT,
        safe_score: DataTypes.FLOAT,
      },
    });
  }

  extract = async () => {};
  transform = () => {};

  load = async (log?: LoggerFn) => {
    await this.bikewayScore(log);
    await this.trafficScore(log);
    await this.fcodeTrafficScore(log);
    await this.fastScore(log);
    await this.safeScore(log);
  };

  insertScore = async (withQueries: string[], fieldName: string) => {
    return new Promise((resolve, reject) => {
      const query = `
        with ${withQueries.join(", ")}
        insert into ${this.name} (id, ${fieldName})
        select id, ${fieldName} from finalWith group by 1, 2
        on conflict (id) do update set ${fieldName} = excluded.${fieldName}
        `;

      db.query(query)
        .then((res) => {
          return resolve(res);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  };

  // 1 - % of street covered by a bikeway
  // thus, 0 = completely covered, 1 = not covered at all
  // should only do by bikeway going same direction!
  bikewayScore = async (log?: LoggerFn) => {
    log && log({ message: "Bikeway Score" });
    const fieldName = "bikeway_score";
    const withQueries = [
      `
        intersections as 
            (select 
                p.id, least(st_length(st_linemerge(st_intersection(b.geometry, st_buffer(p.geometry::geography,5))::geometry)::geography), p.length) / p.length as coverage 
            from bikeways b 
            join petal p on 
                st_intersects(b.geometry , p.geometry) and 
                st_geometrytype(st_intersection(b.geometry , p.geometry)) != 'ST_Point'
        )`,
      // FIX THIS
      `finalWith as (select id, 1 - 2*max(coverage) as ${fieldName} from intersections group by 1)`,
    ];
    return this.insertScore(withQueries, fieldName);
  };

  // normalized values of amount of vehicles per bike going through the intersection per 15 min
  // 0 = least amount of vehicles per bike, 1 = most amount of vehicles per bike
  //SHOULD ONLY DO BY DIRECTIONAL TRAFFIC - TODO
  // maybe doing this / by bike isn't helpful should just be overall traffic
  trafficScore = async (log?: LoggerFn) => {
    log && log({ message: "Traffic Score" });
    const fieldName = "traffic_score";
    // note we're doing a where clause to remove nulls from the table, so this isn't al the intersections in the original table
    // just the ones that have bikes going through

    // vehicles_per_bike is the normalized value of vehicles per bike, so that we can use it in the final calculation

    const withQueries = [
      `avgs as 
        (select 
            geometry,
            avg(sb_cars_t + nb_cars_t + eb_cars_t + wb_cars_t) car_average,
            avg(sb_bus_t + nb_bus_t + eb_bus_t + wb_bus_t) bus_average,
            avg(sb_truck_t + nb_truck_t + eb_truck_t + wb_truck_t) truck_average,
            avg(nx_bike + wx_bike + ex_bike + sx_bike) bike_average,
            avg(((sb_cars_t + nb_cars_t + eb_cars_t + wb_cars_t) + (sb_bus_t + nb_bus_t + eb_bus_t + wb_bus_t) + (sb_truck_t + nb_truck_t + eb_truck_t + wb_truck_t)) / nullif(nx_bike + wx_bike + ex_bike + sx_bike, 0)) vehicles_per_bike
        from traffic group by 1)`,
      // FIX THIS TO BE -1,1
      `traffic_aggregated as 
        (select *, (vehicles_per_bike - min(vehicles_per_bike) OVER ()) / (max(vehicles_per_bike) OVER () - min(vehicles_per_bike) OVER ()) as ${fieldName} from avgs where vehicles_per_bike is not null)`,
      `finalWith as (select p.id, ${fieldName} from traffic_aggregated ta join petal p on st_intersects(ta.geometry, p.a) group by 1, 2)`,
    ];
    return this.insertScore(withQueries, fieldName);
  };

  // useful or no?
  fcodeTrafficScore = async (log?: LoggerFn) => {
    log && log({ message: "Fcode Traffic Score" });
    const fieldName = "fcode_traffic_score";
    const withQueries = [
      `ts as (select id, traffic_score from scores where traffic_score is not null)`,
      `fcode_avgs as (select fcode, avg(traffic_score) ${fieldName} from ts join petal on ts.id = petal.id group by 1)`,
      `finalWith as (select p.id, ${fieldName} from petal p join fcode_avgs f on p.fcode = f.fcode)`,
    ];
    return this.insertScore(withQueries, fieldName);
  };

  // move into petal final table
  fastScore = async (log?: LoggerFn) => {
    // % of street length that we want to multiply by
    // kinda arbitrary, just testing for now
    const weights = {
      length_score: 1,
      bikeway_score: 0.3,
      traffic_score: 1,
    };

    const fieldName = "fast_score";
    log && log({ message: "Fast Score" });
    const withQueries = [
      `finalWith as 
        (select id, length as ${fieldName} from petal)`,
    ];
    return this.insertScore(withQueries, fieldName);
  };

  // move into petal final table
  safeScore = async (log?: LoggerFn) => {
    // % of street length that we want to multiply by
    // kinda arbitrary, just testing for now
    const weights = {
      length_score: 1,
      bikeway_score: 0.3,
      traffic_score: 1,
    };

    const fieldName = "safe_score";
    log && log({ message: "Safe Score" });
    const withQueries = [
      `finalWith as 
        (select p.id, 
          p.length*(${weights.length_score} + ${weights.bikeway_score}*coalesce(s.bikeway_score,0) + ${weights.traffic_score}*coalesce(s.traffic_score, s.fcode_traffic_score, 0)) as ${fieldName}
        from petal p join scores s on p.id = s.id)`,
    ];
    return this.insertScore(withQueries, fieldName);
  };
}
