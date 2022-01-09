import { Command, InvalidArgumentError } from "commander";
import { Octokit } from "octokit";

import { openFileReadStream } from "../utils.js";

import {
  filenameQuestion,
  organizationQuestion,
  repositoryQuestion,
  teamQuestion,
  tokenQuestion,
} from "./questions.js";
import { inviteUsersToOrganization, inviteUsersToRepository } from "./tasks.js";

export const organizationInvitationCommand = () =>
  new Command("org")
    .description("invite users to an organization")
    .argument("[organization]", "github organization path")
    .option("-f, --file <filename>", "file containing invitees")
    .action(async (organization: string, { file }: { file: string }) => {
      const fileReadStream = await openFileReadStream(
        file ?? (await filenameQuestion()),
      );

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
    .description("invite users to a repository")
    .argument("[owner/repo]", "github repository path")
    .option("-f, --file <filename>", "file containing invitees")
    .action(async (repository: string, { file }: { file: string }) => {
      if (repository) {
        const ownerRegex = /(?<owner>[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})/i;
        const repoRegex = /(?<repo>[a-z\d_.-]+)/i;
        const regex = new RegExp(`^${ownerRegex.source}/${repoRegex.source}$`);
        if (!regex.test(repository)) {
          throw new InvalidArgumentError("Invalid owner/repo");
        }
      }

      const fileReadStream = await openFileReadStream(
        file ?? (await filenameQuestion()),
      );

      const token = process.env["GITHUB_TOKEN"] ?? (await tokenQuestion());
      const github = new Octokit({ auth: token });

      const [owner, repo] = (
        repository ?? (await repositoryQuestion(github))
      ).split("/");

      await inviteUsersToRepository(github, { owner, repo }, fileReadStream);
    });

export const rateLimitCommand = () =>
  new Command("limit").description("get rate limit").action(async () => {
    const token = process.env["GITHUB_TOKEN"] ?? (await tokenQuestion());
    const github = new Octokit({ auth: token });

    const {
      data: { rate },
    } = await github.rest.rateLimit.get();

    console.info({
      ...rate,
      reset: new Date(rate.reset * 1000),
    });
  });
