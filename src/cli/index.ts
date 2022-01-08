import { Command } from "commander";

import { GitHub } from "../github.js";
import { openFileReadStream } from "../utils.js";

import {
  inviteUsersToOrganization,
  organizationQuery,
  teamQuery,
  tokenQuery,
} from "./cli.js";

const program = new Command();

program.argument("<filename>").action(async (filename: string) => {
  const fileReadStream = await openFileReadStream(filename);

  const token = process.env["GITHUB_TOKEN"] ?? (await tokenQuery());
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

export default program;
