import path from "path";
import fs from "fs";
import decompress, { File } from "decompress";
import axios from "axios";
import { db } from "../db";
export const dataPath = "./data";
export const tempDataPath = `${dataPath}/temp`;
export const zipPath = `${tempDataPath}/zip`;
export const unzipPath = `${tempDataPath}/unzip`;
export const transormedPath = `${tempDataPath}/transformed`;

export type PropertyTypeMap = { [key: string]: any };
export type PropertyNameMap = { [key: string]: string };

export type SimpleFile =
  | File
  | {
      data: Buffer;
      path: string;
    };

export class Pipeline {
  url: string;
  name: string;
  unzipPath: string;
  transformPath: string;
  extractedDataPaths?: SimpleFile[];
  transformedGeoJsonPath?: string;
  propertyTypeMap?: PropertyTypeMap; // fix type
  propertyNameMap?: PropertyNameMap; // fix type

  constructor(
    url: string,
    name: string,
    propertyTypeMap?: any,
    propertyNameMap?: any
  ) {
    this.url = url;
    this.name = name;
    this.unzipPath = `${unzipPath}/${this.name}`;
    this.transformPath = `${transormedPath}/${this.name}`;
    this.propertyTypeMap = propertyTypeMap;
    this.propertyNameMap = propertyNameMap;
  }

  extract = () => {
    return new Promise(async (resolve, reject) => {
      this.makeExtractedDataDirectory();

      // step 1. download zip file to data/temp/zip
      const filename = path.basename(this.url);
      const filePath = `${
        filename.endsWith(".zip") ? zipPath : this.unzipPath
      }/${filename}`;

      console.log("Downloading", filename);

      axios
        .get(this.url, { responseType: "stream" })
        .then((res) => {
          const fileStream = fs.createWriteStream(filePath);
          res.data.pipe(fileStream);

          fileStream.on("error", (error: any) => {
            reject(error);
          });

          fileStream.on("finish", () => {
            fileStream.close();

            console.log("Downloaded", filename);

            if (filename.endsWith(".zip")) {
              console.log("Unzipping", filename);

              // step 2. unzip file to data/temp/unzip
              decompress(filePath, this.unzipPath)
                .then((files) => {
                  this.extractedDataPaths = files;
                  console.log("Unzipped", filename);
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
    console.log("Transforming", this.name);
    this.makeTransformedDataDirectory();
    this.childTransform();
    console.log("Done transforming", this.name);
  };

  childTransform = () => {
    if (this.extractedDataPaths && this.extractedDataPaths.length > 0) {
      this.transformGeoJson(this.extractedDataPaths[0], this.propertyNameMap);
    }
  };

  load = () => {
    return new Promise((resolve, reject) => {
      if (this.propertyTypeMap && this.transformedGeoJsonPath) {
        const file = fs.readFileSync(this.transformedGeoJsonPath);
        const json = JSON.parse(file.toString());
        db.define(this.name, this.propertyTypeMap, {
          indexes:
            (this.propertyTypeMap.geometry && [
              {
                using: "gist",
                fields: ["geometry"],
              },
            ]) ||
            [],
        });
        db.sync({ force: true })
          .then(() => {
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
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject();
      }
    });
  };

  transformGeoJson = (file: SimpleFile, propertyMap?: PropertyNameMap) => {
    if (propertyMap) {
      const jsonData = JSON.parse(file.data.toString());
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

    if (!fs.existsSync(this.unzipPath)) {
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

    if (!fs.existsSync(this.transformPath)) {
      fs.mkdirSync(this.transformPath);
    }
  };
}
