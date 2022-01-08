import chalk from "chalk";
import { oraPromise } from "ora";

import { createLineStream, validateEmail } from "../utils.js";

import type { Octokit } from "octokit";

export const inviteUsersToOrganization = async (
  github: Octokit,
  { org, team_ids }: { org: string; team_ids?: number[] },
  readStream: NodeJS.ReadableStream,
) =>
  oraPromise(async (spinner) => {
    try {
      const lineInterface = createLineStream(readStream);
      for await (const id of lineInterface) {
        spinner.text = `Invite ${chalk.cyan(id)}...`;
        await github.rest.orgs.createInvitation({
          org,
          [validateEmail(id) ? "email" : "invitee_id"]: id,
          team_ids,
        });
      }
      spinner.succeed("Done");
    } catch (error) {
      if (error instanceof Error) {
        spinner.fail(`${error.name}: ${error.message}`);
      }
    }
  });

export const inviteUsersToRepository = async (
  github: Octokit,
  { owner, repo }: { owner: string; repo: string },
  readStream: NodeJS.ReadableStream,
) =>
  oraPromise(async (spinner) => {
    try {
      const lineInterface = createLineStream(readStream);
      for await (const id of lineInterface) {
        if (validateEmail(id)) {
          throw new Error(
            `Repository invitation is not supported for email: ${id}`,
          );
        }
        spinner.text = `Invite ${chalk.cyan(id)}...`;
        await github.rest.repos.addCollaborator({
          owner,
          repo,
          username: id,
        });
      }
      spinner.succeed("Done");
    } catch (error) {
      if (error instanceof Error) {
        spinner.fail(`${error.name}: ${error.message}`);
      }
    }
  });
