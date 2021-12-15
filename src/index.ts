#!/usr/bin/env node
import { program } from "commander";

import {
  inviteUsersToOrganization,
  organizationQuery,
  tokenQuery,
} from "./cli.js";
import { GitHub } from "./github.js";
import { openFileReadStream, readPackageJson } from "./utils.js";

function main() {
  const { version, name } = readPackageJson();

  program.name(name).version(version);

  program.argument("<filename>").action(async (filename: string) => {
    try {
      const fileReadStream = await openFileReadStream(filename);

      const token = await tokenQuery();
      const github = new GitHub(token);

      const selectedOrganization = await organizationQuery(github);
      await inviteUsersToOrganization(
        github,
        selectedOrganization,
        fileReadStream,
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(`${error.name}: ${error.message}`);
      }
    }
  });

  program.showSuggestionAfterError().showHelpAfterError().parse(process.argv);
}

main();
