import { constants, createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { dirname } from "node:path";
import * as readline from "node:readline";
import { fileURLToPath } from "node:url";

import { readPackageUpSync } from "read-pkg-up";

export const validateEmail = (email: string) =>
  /^([a-z0-9_-]+(?:\.[a-z0-9_-]+)*)@((?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?))$/i.test(
    email,
  );

export const openFileReadStream = async (path: string) => {
  await access(path, constants.R_OK);
  return createReadStream(path);
};

export const readPackageJson = () => {
  const foundPackage = readPackageUpSync({
    cwd: dirname(fileURLToPath(import.meta.url)),
  });

  if (!foundPackage) {
    throw new Error("Could not find package.json");
  }

  return foundPackage?.packageJson;
};

export const createLineStream = (input: NodeJS.ReadableStream) =>
  readline.createInterface({
    input,
  });
