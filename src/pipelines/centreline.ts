import { DataTypes } from "sequelize";
import { Pipeline } from "./pipeline";

/*
201100	Expressway
201101	Expressway Ramp
201200	Major Arterial
201201	Major Arterial Ramp
201300	Minor Arterial
201301	Minor Arterial Ramp
201400	Collector
201401	Collector Ramp
201500	Local
201600	Other
201601	Other Ramp
201700	Laneway
201800	Pending
201801	Busway
201803	Access Road
202001	Major Railway
202002	Minor Railway
203001	River
203002	Creek/Tributary
204001	Trail
204002	Walkway
205001	Hydro Line
*/

const unweighted: Record<number, number> = {
  201700: 1,
  201500: 1,
  205001: 0,
  201100: 0, // highway?
  201101: 0, // highway ramp?
  201200: 1,
  201201: 1,
  201300: 1, // minor highways? confrm you can even bike on these
  201301: 1, // minor highway ramp?
  201400: 1, // major road?
  201401: 1, // major road ramp?
  201600: 1,
  201601: 1,
  201800: 1,
  201801: 0,
  201803: 1,
  202001: 0,
  202002: 0,
  203001: 0,
  203002: 0,
  204001: 1,
  204002: 1,
  206001: 0,
  206002: 0,
  207001: 0,
  208001: 0,
};

export class CentrelinePipeline extends Pipeline {
  constructor() {
    super({
      url: "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/1d079757-377b-4564-82df-eb5638583bfb/resource/7bc94ccf-7bcf-4a7d-88b1-bdfc8ec5aaf1/download/centreline-version-2-4326.geojson",
      name: "centreline",
      propertyTypeMap: {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        legal_name: DataTypes.STRING,
        address_l: DataTypes.STRING,
        address_r: DataTypes.STRING,
        parity_l: DataTypes.STRING,
        parity_r: DataTypes.STRING,
        lo_num_l: DataTypes.INTEGER,
        hi_num_l: DataTypes.INTEGER,
        lo_num_r: DataTypes.INTEGER,
        hi_num_r: DataTypes.INTEGER,
        begin_addr_point_id_l: DataTypes.INTEGER,
        end_addr_point_id_l: DataTypes.INTEGER,
        begin_addr_point_id_r: DataTypes.INTEGER,
        end_addr_point_id_r: DataTypes.INTEGER,
        begin_addr_l: DataTypes.INTEGER,
        end_addr_l: DataTypes.INTEGER,
        begin_addr_r: DataTypes.INTEGER,
        end_addr_r: DataTypes.INTEGER,
        low_num_odd: DataTypes.INTEGER,
        high_num_odd: DataTypes.INTEGER,
        low_num_even: DataTypes.INTEGER,
        high_num_even: DataTypes.INTEGER,
        linear_name: DataTypes.STRING,
        linear_name_type: DataTypes.STRING,
        linear_name_dir: DataTypes.STRING,
        description: DataTypes.STRING,
        from_intersection_id: DataTypes.INTEGER,
        to_intersection_id: DataTypes.INTEGER,
        oneway_dir_code: DataTypes.INTEGER,
        oneway_dir_desc: DataTypes.STRING,
        fcode: DataTypes.INTEGER,
        fcode_description: DataTypes.STRING,
        geometry: DataTypes.GEOMETRY,
      },
      propertyNameMap: {
        _id: "id",
        LINEAR_NAME_FULL_LEGAL: "legal_name",
        ADDRESS_L: "address_l",
        ADDRESS_R: "address_r",
        PARITY_L: "parity_l",
        PARITY_R: "parity_r",
        LO_NUM_L: "lo_num_l",
        HI_NUM_L: "hi_num_l",
        LO_NUM_R: "lo_num_r",
        HI_NUM_R: "hi_num_r",
        BEGIN_ADDR_POINT_ID_L: "begin_addr_point_id_l",
        END_ADDR_POINT_ID_L: "end_addr_point_id_l",
        BEGIN_ADDR_POINT_ID_R: "begin_addr_point_id_r",
        END_ADDR_POINT_ID_R: "end_addr_point_id_r",
        BEGIN_ADDR_L: "begin_addr_l",
        END_ADDR_L: "end_addr_l",
        BEGIN_ADDR_R: "begin_addr_r",
        END_ADDR_R: "end_addr_r",
        LOW_NUM_ODD: "low_num_odd",
        HIGH_NUM_ODD: "high_num_odd",
        LOW_NUM_EVEN: "low_num_even",
        HIGH_NUM_EVEN: "high_num_even",
        LINEAR_NAME: "linear_name",
        LINEAR_NAME_TYPE: "linear_name_type",
        LINEAR_NAME_DIR: "linear_name_dir",
        LINEAR_NAME_DESC: "description",
        FROM_INTERSECTION_ID: "from_intersection_id",
        TO_INTERSECTION_ID: "to_intersection_id",
        ONEWAY_DIR_CODE: "oneway_dir_code",
        ONEWAY_DIR_CODE_DESC: "oneway_dir_desc",
        FEATURE_CODE: "fcode",
        FEATURE_CODE_DESC: "fcode_description",
      },
      propertyFilterMap: {
        fcode: [
          201700, 201500, 201200, 201201, 201300, 201301, 201400, 201401,
          201600, 201601, 201800, 201803, 204001, 204002,
        ],
      },
    });
  }
}
