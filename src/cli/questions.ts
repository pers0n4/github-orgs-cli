import inquirer from "inquirer";
import fuzzyPath from "inquirer-fuzzy-path";
import searchCheckbox from "inquirer-search-checkbox";

import type { Octokit } from "octokit";

inquirer.registerPrompt("fuzzyPath", fuzzyPath);
inquirer.registerPrompt("searchCheckbox", searchCheckbox);

export const tokenQuestion = async (): Promise<string> => {
  const { token } = await inquirer.prompt<{ token: string }>({
    type: "password",
    name: "token",
    message: "GitHub Token",
    mask: "*",
    validate: (input: string) => !!input.trim() || "Please enter a valid token",
  });

  return token;
};

export const organizationQuestion = async (
  github: Octokit,
): Promise<string> => {
  const { data: orgs } = await github.rest.orgs.listForAuthenticatedUser();
  const { organization } = await inquirer.prompt<{ organization: string }>([
    {
      type: "list",
      name: "organization",
      message: "Select an organization to invite",
      choices: orgs.map((org) => org.login),
    },
  ]);
  return organization;
};

export const teamQuestion = async (github: Octokit, org: string) => {
  const { teamIds } = await inquirer.prompt<{
    shouldInviteWithTeams: boolean;
    teamIds?: number[];
  }>([
    {
      type: "confirm",
      name: "shouldInviteWithTeams",
      message: "Invite with teams?",
      default: false,
    },
    {
      type: "searchCheckbox",
      name: "teamIds",
      message: "Select teams",
      choices: async () => {
        const { data: teams } = await github.rest.teams.list({
          org,
        });
        return teams.map((team) => ({ name: team.name, value: team.id }));
      },
      when: ({ shouldInviteWithTeams }) => shouldInviteWithTeams,
    },
  ]);

  return teamIds;
};

export const filenameQuestion = async () => {
  const { filename } = await inquirer.prompt<{ filename: string }>([
    {
      type: "fuzzyPath",
      name: "filename",
      message: "Select a file containing invitees",
      itemType: "file",
      excludePath: (nodePath: string) =>
        ["node_modules", ".git"].some((word) => nodePath.startsWith(word)),
    },
  ]);

  return filename;
};
