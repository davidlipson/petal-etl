import { db } from "../db";
import { Pipeline } from "./pipeline";

export class PetalGraphPipeline extends Pipeline {
  constructor() {
    super({
      name: "petal",
    });
  }

  extract = async () => {};
  transform = () => {};
  load = async () => {
    return new Promise((resolve, reject) => {
      // arriving / departing angles

      // 1. all intersections between edges in centreline
      const centreline_edges = `
        with connected_streets as 
            (select 
                c1.id as street_a, 
                c1.legal_name as sa_name, 
                st_length(st_linemerge(c1.geometry)::geography) as len, 
                c1.fcode as type, 
                c2.id as street_b, 
                c1.geometry sa_geom, 
                c2.geometry sb_geom, 
                st_intersection(c1.geometry, c2.geometry) pos 
	        from centreline c1 join centreline c2 on st_intersects(c1.geometry, c2.geometry) where c1.id != c2.id)
        select 
            cs.type as fcode, 
            cs.pos as A, 
            cs_joined.pos as B, 
            cs.sa_geom as street_geom, 
            cs.len as street_length, 
            cs.sa_name as street_name, 
            cs.street_a as a_id, 
            cs.street_b as b_id 
        from connected_streets cs join connected_streets cs_joined on cs.street_a = cs_joined.street_a 
        where not st_equals(cs.pos, cs_joined.pos) 
        group by cs.pos, cs_joined.pos, cs.sa_geom, cs.len, cs.sa_name, cs.street_a, cs.street_b, cs.type`;

      const centreline_graph = `
        with 
            points as 
                (SELECT a, string_agg(distinct cast(a_id as TEXT), '-') name FROM centreline_edges GROUP BY a),
            a_names as 
                (select yes2.*, points.name as a_intersection from centreline_edges yes2 join points on yes2.a = points.a)
        select 
            a_names.*, 
            points.name as b_intersection 
        from a_names join points on a_names.b = points.a`;

      db.query(`drop table if exists ${this.name}`)
        .then((res) => {
          db.query(
            `
                create table ${this.name} as (with centreline_edges as (${centreline_edges}),
                centreline_graph as (${centreline_graph})
                select 
                    uuid_generate_v1() edge_id,
                    fcode,
                    a, a_intersection,
                    b, b_intersection,
                    street_geom geometry,
                    street_length length,
                    street_name 
                from centreline_graph)
                `
          )
            .then((res) => {
              console.log(res);
              return resolve(res);
            })
            .catch((err) => {
              return reject(err);
            });
        })
        .catch((err) => {
          return reject(err);
        });
    });
  };
}
