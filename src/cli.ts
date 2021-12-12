import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import type { GitHub } from "./github.js";
import { createLineStream, validateEmail } from "./utils.js";

export const tokenQuery = async () => {
  const { token } = await inquirer.prompt({
    type: "password",
    name: "token",
    message: "GitHub Token:",
    default: process.env["GITHUB_TOKEN"],
    mask: "*",
    validate: (input: string) => !!input.trim() || "Please enter a valid token",
  });

  return token;
};

export const organizationQuery = async (github: GitHub) => {
  const userOrganizations =
    await github.listOrganizationsForAuthenticatedUser();

  const { organization } = await inquirer.prompt([
    {
      type: "list",
      name: "organization",
      message: "Select organization for invitation:",
      choices: userOrganizations.map((org) => org.login),
    },
  ]);

  return organization;
};

export const inviteUsersToOrganization = async (
  github: GitHub,
  org: string,
  readStream: NodeJS.ReadableStream,
) => {
  const spinner = ora("Loading...").start();
  try {
    const lineInterface = createLineStream(readStream);
    for await (const line of lineInterface) {
      spinner.text = `Invite ${chalk.cyan(line)}...`;

      if (validateEmail(line)) {
        await github.inviteToOrganizationMember({
          org,
          email: line,
        });
      } else {
        await github.inviteToOrganizationMember({
          org,
          invitee_id: await github.getUserIdByUsername(line),
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
