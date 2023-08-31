import { db } from "../db";
import { Pipeline } from "./pipeline";

export class AddressClosestEdgePipeline extends Pipeline {
  constructor() {
    super({});
  }

  extract = async () => {};
  transform = () => {};

  load = async () => {
    return new Promise((resolve, reject) => {
      const query = `
      insert into addresses (id, closest_edge_id)
        SELECT ad.id id, closest.id closest_edge_id
        FROM addresses ad
          CROSS JOIN LATERAL (
            SELECT id, a_intersection, b_intersection, geometry
            FROM petal
            ORDER BY geometry <-> ad.geometry
            LIMIT 1
          ) closest
      on conflict (id) do update set closest_edge_id = excluded.closest_edge_id
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
}
