import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";

import { createLineStream, validateEmail } from "./utils.js";

import type { GitHub } from "./github.js";

export const tokenQuery = async (): Promise<string> => {
  const { token } = await inquirer.prompt<{ token: string }>({
    type: "password",
    name: "token",
    message: "GitHub Token:",
    default: process.env["GITHUB_TOKEN"],
    mask: "*",
    validate: (input: string) => !!input.trim() || "Please enter a valid token",
  });

  return token;
};

export const organizationQuery = async (github: GitHub): Promise<string> => {
  const userOrganizations =
    await github.listOrganizationsForAuthenticatedUser();

  const { organization } = await inquirer.prompt<{ organization: string }>([
    {
      type: "list",
      name: "organization",
      message: "Select organization for invitation:",
      choices: userOrganizations.map((org) => org.login),
    },
  ]);

  return organization;
};

export const teamQuery = async (github: GitHub, org: string) => {
  const { teamIds } = await inquirer.prompt<{
    inviteWithTeams: boolean;
    teamIds?: number[];
  }>([
    {
      type: "confirm",
      name: "inviteWithTeams",
      message: "Do you want to invite to a team?",
      default: false,
    },
    {
      type: "checkbox",
      name: "teamIds",
      message: "Select teams:",
      choices: async () => {
        const teams = (await github.listTeamsOfOrganization(org)).map(
          (team) => ({ name: team.name, value: team.id }),
        );
        if (!teams.length) {
          return [new inquirer.Separator("No teams found")];
        }
        return teams;
      },
      when: (answers) => answers.inviteWithTeams,
    },
  ]);

  return teamIds;
};

export const inviteUsersToOrganization = async (
  github: GitHub,
  readStream: NodeJS.ReadableStream,
  org: string,
  team_ids?: number[],
) => {
  const spinner = ora("Loading...").start();
  try {
    const lineInterface = createLineStream(readStream);
    for await (const line of lineInterface) {
      spinner.text = `Invite ${chalk.cyan(line)}...`;

      if (validateEmail(line)) {
        await github.inviteUserToOrganizationMember({
          org,
          email: line,
          team_ids,
        });
      } else {
        await github.inviteUserToOrganizationMember({
          org,
          invitee_id: await github.getUserIdByUsername(line),
          team_ids,
        });
      }
    }
    spinner.succeed("Done");
  } catch (error) {
    if (error instanceof Error) {
      spinner.fail(`${error.name}: ${error.message}`);
    }
  }
};

export const inviteUsersToRepository = async (
  github: GitHub,
  readStream: NodeJS.ReadableStream,
  owner: string,
  repo: string,
) => {
  const spinner = ora("Loading...").start();
  try {
    const lineInterface = createLineStream(readStream);
    for await (const line of lineInterface) {
      if (validateEmail(line)) {
        throw new Error(
          `Repository invitation is not supported for email: ${line}`,
        );
      }
      spinner.text = `Invite ${chalk.cyan(line)}...`;

      await github.inviteUserToRepositoryCollaborator(owner, repo, line);
    }
    spinner.succeed("Done");
  } catch (error) {
    if (error instanceof Error) {
      spinner.fail(`${error.name}: ${error.message}`);
    }
  }
};
