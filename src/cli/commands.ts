import { Command } from "commander";
import { Octokit } from "octokit";

import { openFileReadStream } from "../utils.js";

import {
  organizationQuestion,
  teamQuestion,
  tokenQuestion,
} from "./questions.js";
import { inviteUsersToOrganization } from "./tasks.js";

export const organizationInvitationCommand = () =>
  new Command("org")
    .description("Invite users to an organization")
    .argument("[organization]", "github organization path")
    .argument("[filename]", "file containing invitees")
    .action(async (organization: string, filename: string) => {
      const fileReadStream = await openFileReadStream(filename);

      const token = process.env["GITHUB_TOKEN"] ?? (await tokenQuestion());
      const github = new Octokit({ auth: token });

      const org = organization ?? (await organizationQuestion(github));
      const team_ids = await teamQuestion(github, org);

      await inviteUsersToOrganization(
        github,
        { org, team_ids },
        fileReadStream,
      );
    });

export const repositoryInvitationCommand = () =>
  new Command("repo")
    .description("Invite users to a repository")
    .argument("[repository]", "github repository path")
    .argument("[filename]", "file containing invitees");
