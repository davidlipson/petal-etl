import { DataTypes } from "sequelize";
import { Pipeline } from "./pipeline";

export class BikewaysPipeline extends Pipeline {
  // { "type": "Feature", "properties": { "_id": 7939, "OBJECTID": 1, "SEGMENT_ID": 1, "INSTALLED": 2001, "UPGRADED": 2021, "PRE_AMALGAMATION": "", "STREET_NAME": "Kilbarry Rd", "FROM_STREET": "Highbourne Rd", "TO_STREET": "Oriole Pkwy", "ROADCLASS": "", "CNPCLASS": "", "SURFACE": "", "OWNER": "", "DIR_LOWORDER": "", "INFRA_LOWORDER": "Sharrows - Wayfinding", "SEPA_LOWORDER": "", "SEPB_LOWORDER": "", "ORIG_LOWORDER_INFRA": "", "DIR_HIGHORDER": "", "INFRA_HIGHORDER": "Sharrows - Wayfinding", "SEPA_HIGHORDER": "", "SEPB_HIGHORDER": "", "ORIG_HIGHORDER": "", "BYLAWED": "", "EDITOR": "", "LAST_EDIT_DATE": "2023-01-25T15:57:24", "UPGRADE_DESCRIPTION": "", "CONVERTED": "2007", "X": 0.0, "Y": 0.0, "LONGITUDE": 0.0, "LATITUDE": 0.0, "Shape__Length": 128.04521091237601 }, "geometry": { "type": "MultiLineString", "coordinates": [ [ [ -79.403506913629698, 43.695259524494098 ], [ -79.403094474997701, 43.6953493145039 ], [ -79.402403558462098, 43.695494538572497 ] ] ] } },

  constructor() {
    super(
      "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/ac87ebfc-d67a-4a63-9528-5474ff33cb68/resource/2af3f58c-562b-4e77-accf-210b6bbf111d/download/bike-network-data-4326.geojson",
      "bikeways",
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        street_name: DataTypes.STRING,
        from_street: DataTypes.STRING,
        to_street: DataTypes.STRING,
        length: DataTypes.FLOAT,
        geometry: DataTypes.GEOMETRY,
      },
      {
        _id: "id",
        STREET_NAME: "street_name",
        FROM_STREET: "from_street",
        TO_STREET: "to_street",
        Shape__Length: "length",
      }
    );
  }
}
