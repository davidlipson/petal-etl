import { DataTypes } from "sequelize";
import { db } from "../db";
import { Pipeline } from "./pipeline";

export class PetalGraphPipeline extends Pipeline {
  constructor() {
    super({
      name: "petal",
      propertyTypeMap: {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
        },
        fcode: DataTypes.STRING,
        a_intersection: DataTypes.STRING,
        b_intersection: DataTypes.STRING,
        street_name: DataTypes.STRING,
        length: DataTypes.FLOAT,
        departing_angle: DataTypes.FLOAT,
        arriving_angle: DataTypes.FLOAT,
        a: DataTypes.GEOMETRY,
        b: DataTypes.GEOMETRY,
        geometry: DataTypes.GEOMETRY,
      },
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

      const basic_table = `
      with centreline_edges as (${centreline_edges}),
      centreline_graph as (${centreline_graph}),
      initial_table as 
      (select 
          uuid_generate_v1() id,
          fcode,
          a, a_intersection,
          b, b_intersection,
          street_geom geometry,
          street_length length,
          street_name 
      from centreline_graph group by fcode, a, b, street_geom, street_length , street_name, a_intersection, b_intersection)`;

      // format and double check its right
      // this can definitely be wayyyy cleaner and simpler to get angles
      const table_with_angles = `
        ${basic_table},
        nonmultipoint as (select * from initial_table p where st_numgeometries(a) = 1),
        buffered_nodes as (select * from (select st_exteriorring(st_buffer(a::geography, 5)::geometry) a_buff, * from nonmultipoint cg) sub where a_buff is not null),
        edge_sections as (select * from (select id, a, a_buff, st_closestpoint(a_buff, geometry) end_pt, b, geometry from buffered_nodes) sub where end_pt is not null),
        angles as (select id, a, b, degrees(st_azimuth(a, end_pt)) as angle from edge_sections),
        final_angles as (select cg.id, cg.a, cg.b, cg.angle departing_angle, cg2.angle arriving_angle from angles cg join angles cg2 on cg.b = cg2.a and cg.a = cg2.b
        group by cg.id, cg.a, cg.b, cg.angle, cg2.angle)`;

      /*const final_query = `
        ${table_with_angles}
        insert into ${this.name} (id, fcode, a, a_intersection, b, b_intersection, geometry, length, street_name, departing_angle, arriving_angle)
          select i.*, a.departing_angle, a.arriving_angle from initial_table i join final_angles a on i.id = a.id
      `;*/

      const final_query = `
      ${table_with_angles}
      insert into ${this.name} (id, fcode, a, a_intersection, b, b_intersection, geometry, length, street_name)
        select * from initial_table
    `;

      db.query(final_query)
        .then((res) => {
          return resolve(res);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  };
}
