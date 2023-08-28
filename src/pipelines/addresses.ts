import { Pipeline } from "./pipeline";
import fs from "fs";
import { db } from "../db";
import { DataTypes, Sequelize } from "sequelize";

export class AddressesPipeline extends Pipeline {
  //https://stackoverflow.com/questions/32059758/how-to-insert-a-postgis-geometry-point-in-sequelize-orm

  constructor() {
    super({
      url: "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/abedd8bc-e3dd-4d45-8e69-79165a76e4fa/resource/bdb0a332-aa84-42de-ac49-214cc68bb5ee/download/address_point_wgs84_geojson.zip",
      name: "addresses",
      propertyTypeMap: {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        number: DataTypes.FLOAT,
        street_name: DataTypes.STRING,
        low_number: DataTypes.FLOAT,
        high_number: DataTypes.FLOAT,
        low_suffix: DataTypes.STRING,
        high_suffix: DataTypes.STRING,
        street_side: DataTypes.STRING,
        distance: DataTypes.FLOAT,
        fcode: DataTypes.STRING,
        fcode_description: DataTypes.STRING,
        classification: DataTypes.STRING,
        name: DataTypes.STRING,
        ward: DataTypes.STRING,
        municipality: DataTypes.STRING,
        geometry: DataTypes.GEOMETRY("POINT", 4326),
      },
      propertyNameMap: {
        GEO_ID: "id",
        ADDRESS: "number",
        LFNAME: "street_name",
        LO_NUM: "low_number",
        HINUM: "high_number",
        LONUMSUF: "low_suffix",
        HINUMSUF: "high_suffix",
        ARC_SIDE: "street_side",
        DISTANCE: "distance",
        FCODE: "fcode",
        CLASS: "classification",
        NAME: "name",
        WARD_NAME: "ward",
        MUN_NAME: "municipality",
      },
    });
  }
}
