import path from "path";
import fs from "fs";
import decompress, { File } from "decompress";
import axios from "axios";
import { db } from "../db";
import { LoggerFn } from "../etl";

export const dataPath = "./data";
export const tempDataPath = `${dataPath}/temp`;
export const zipPath = `${tempDataPath}/zip`;
export const unzipPath = `${tempDataPath}/unzip`;
export const transormedPath = `${tempDataPath}/transformed`;

export type PropertyTypeMap = { [key: string]: any };
export type PropertyNameMap = { [key: string]: string };
export type PropertyFilterMap = { [key: string]: any[] };

export type SimpleFile =
  | File
  | {
      data: Buffer;
      path: string;
    };

export interface PipelineArgs {
  url?: string;
  name?: string;
  propertyTypeMap?: PropertyTypeMap;
  propertyNameMap?: PropertyNameMap;
  propertyFilterMap?: PropertyFilterMap;
  format?: FileFormat;
}

export type FileFormat = "csv" | "json" | "geojson";

export class Pipeline {
  url?: string;
  name?: string;
  unzipPath?: string;
  transformPath?: string;
  extractedDataPaths?: SimpleFile[];
  transformedGeoJsonPath?: string;
  propertyTypeMap?: PropertyTypeMap; // fix type
  propertyNameMap?: PropertyNameMap; // fix type
  propertyFilterMap?: PropertyFilterMap; // fix type
  format: FileFormat;

  constructor(args: PipelineArgs) {
    const {
      url,
      name,
      propertyTypeMap,
      propertyNameMap,
      propertyFilterMap,
      format = "geojson",
    } = args;
    this.url = url;
    this.name = name;
    this.propertyTypeMap = propertyTypeMap;
    this.propertyNameMap = propertyNameMap;
    this.propertyFilterMap = propertyFilterMap;
    this.format = format;
    if (this.name) {
      this.unzipPath = `${unzipPath}/${this.name}`;
      this.transformPath = `${transormedPath}/${this.name}`;
    }
  }

  extract = (log?: LoggerFn) => {
    return new Promise(async (resolve, reject) => {
      if (!this.url || !this.name) {
        return resolve("No url or name defined.");
      }

      this.makeExtractedDataDirectory();

      // step 1. download zip file to data/temp/zip
      const filename = path.basename(this.url);
      const filePath = `${
        filename.endsWith(".zip") ? zipPath : this.unzipPath
      }/${filename}`;

      let totalDownloaded = 0;

      axios
        .get(this.url, { responseType: "stream" })
        .then((res) => {
          const fileStream = fs.createWriteStream(filePath);
          res.data.pipe(fileStream);

          fileStream.on("error", (error: any) => {
            reject(error);
          });

          res.data.on("data", (chunk: any) => {
            totalDownloaded += chunk.length;
            log &&
              process.env.PRODUCTION &&
              log({
                progress: totalDownloaded / res.headers["content-length"],
              });
          });

          fileStream.on("finish", () => {
            fileStream.close();

            if (filename.endsWith(".zip")) {
              // step 2. unzip file to data/temp/unzip
              decompress(filePath, this.unzipPath)
                .then((files) => {
                  this.extractedDataPaths = files;
                  resolve("Done unzipping/extracting.");
                })
                .catch((error: any) => {
                  reject(error);
                });
            } else {
              this.extractedDataPaths = [
                {
                  data: fs.readFileSync(filePath),
                  path: filePath,
                },
              ];
              resolve("Done extracting.");
            }
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  // we can probably unify all the transform logic into this one place
  // if all are json/geojson files
  transform = () => {
    this.makeTransformedDataDirectory();
    this.childTransform();
  };

  childTransform = () => {
    this.transformGeoJson();
  };

  defineModal = () => {
    return new Promise((resolve, reject) => {
      if (!this.name || !this.propertyTypeMap) {
        return resolve("No name defined.");
      }
      db.define(this.name, this.propertyTypeMap, {
        freezeTableName: true,
        timestamps: false,
        indexes:
          (this.propertyTypeMap.geometry && [
            {
              using: "gist",
              fields: ["geometry"],
            },
          ]) ||
          [],
      });
      return resolve("Defined.");
    });
  };

  load = (log?: LoggerFn) => {
    return new Promise((resolve, reject) => {
      if (this.propertyTypeMap && this.transformedGeoJsonPath && this.name) {
        const file = fs.readFileSync(this.transformedGeoJsonPath);
        const json = JSON.parse(file.toString());
        db.models[this.name]
          .bulkCreate(json.features, {
            returning: false,
          })
          .then(() => {
            resolve("Done loading.");
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        resolve("No propertyTypeMap or transformedGeoJsonPath defined.");
      }
    });
  };

  transformGeoJson = () => {
    if (
      this.extractedDataPaths &&
      this.extractedDataPaths.length > 0 &&
      this.propertyNameMap
    ) {
      const file = this.extractedDataPaths[0];
      const propertyMap = this.propertyNameMap;
      const filters = this.propertyFilterMap;
      let jsonData = JSON.parse(file.data.toString());
      jsonData.features.forEach((feature: any) => {
        delete feature.type;
        Object.keys(feature.properties).forEach((property: any) => {
          if (propertyMap[property]) {
            feature[propertyMap[property] || property] =
              feature.properties[property];
          }
          delete feature.properties[property];
        });
        delete feature.properties;
      });
      if (filters) {
        Object.keys(filters).forEach((filter: any) => {
          jsonData.features = jsonData.features.filter((row: any) => {
            return filters[filter].includes(row[filter]);
          });
        });
      }
      this.saveTransformedData(jsonData);
    }
  };

  saveTransformedData = (data: any) => {
    const transformedGeoJsonPath = `${this.transformPath}/${this.name}_transformed.json`;
    fs.writeFileSync(transformedGeoJsonPath, JSON.stringify(data, null, 2));
    this.transformedGeoJsonPath = transformedGeoJsonPath;
  };

  makeExtractedDataDirectory = () => {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath);
    }

    if (!fs.existsSync(tempDataPath)) {
      fs.mkdirSync(tempDataPath);
    }

    if (!fs.existsSync(zipPath)) {
      fs.mkdirSync(zipPath);
    }

    if (!fs.existsSync(unzipPath)) {
      fs.mkdirSync(unzipPath);
    }

    if (this.unzipPath && !fs.existsSync(this.unzipPath)) {
      fs.mkdirSync(this.unzipPath);
    }
  };

  makeTransformedDataDirectory = () => {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath);
    }

    if (!fs.existsSync(tempDataPath)) {
      fs.mkdirSync(tempDataPath);
    }

    if (!fs.existsSync(transormedPath)) {
      fs.mkdirSync(transormedPath);
    }

    if (this.transformPath && !fs.existsSync(this.transformPath)) {
      fs.mkdirSync(this.transformPath);
    }
  };
}
