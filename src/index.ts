#!/usr/bin/env node
import { program } from "commander";

import {
  inviteUsersToOrganization,
  organizationQuery,
  teamQuery,
  tokenQuery,
} from "./cli.js";
import { GitHub } from "./github.js";
import { openFileReadStream, readPackageJson } from "./utils.js";

function main() {
  const { version, name } = readPackageJson();

  program.name(name).version(version);

  program.argument("<filename>").action(async (filename: string) => {
    const fileReadStream = await openFileReadStream(filename);

    const token = await tokenQuery();
    const github = new GitHub(token);

    const selectedOrganization = await organizationQuery(github);
    const teamIds = await teamQuery(github, selectedOrganization);

    await inviteUsersToOrganization(
      github,
      fileReadStream,
      selectedOrganization,
      teamIds,
    );
  });

  program.showSuggestionAfterError().showHelpAfterError().parse(process.argv);
}

try {
  main();
} catch (error) {
  console.error(error);
}
