import { accessSync, constants, createReadStream, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

import { readPackageUpSync } from "read-pkg-up";

export const checkFileExist = (path: string) => {
  accessSync(path, constants.R_OK);
  return path;
};

export const createFileReadStream = (path: string) => {
  checkFileExist(path);
  return createInterface({
    input: createReadStream(path),
  });
};

export const readFileLinesAsArray = (path: string) =>
  readFileSync(path, {
    encoding: "utf8",
    flag: "r",
  })
    .trim()
    .split("\n");

export const readPackage = () => {
  const foundPackage = readPackageUpSync({
    cwd: dirname(fileURLToPath(import.meta.url)),
  });
  if (!foundPackage) {
    throw new Error("Could not find package.json");
  }
  return foundPackage.packageJson;
};

export const validateEmail = (text: string) =>
  /^([a-z0-9_-]+(?:\.[a-z0-9_-]+)*)@((?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?))$/i.test(
    text,
  );
