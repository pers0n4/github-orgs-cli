import { Command, OptionValues } from "commander";
import { createWriteStream } from "fs";
import inquirer from "inquirer";
import { Octokit } from "octokit";
import { readFileLinesAsArray, validateEmail } from "../../helper.js";
import questions from "../../questions.js";

type Invitee =
  | {
      readonly type: "email";
      readonly value: string;
    }
  | {
      readonly type: "invitee_id";
      readonly value: number;
    };

const error = createWriteStream("github-orgs-error.log", { flags: "a" });

export default new Command("org")
  .description("invite users to an organization [with teams]")
  .argument("[org]", "GitHub organization")
  .hook("preAction", async (command) => {
    let { file } = command.optsWithGlobals();
    if (!file) {
      ({ file } = await inquirer.prompt(questions.file()));
      command.setOptionValue("file", file);
    }
  })
  .action(async (org: string, _options: OptionValues, command: Command) => {
    const { token, file } = command.optsWithGlobals();
    const github = new Octokit({ auth: token });

    // NOTE: when `org` is not provided from the command line
    if (!org) {
      const { data: orgs } = await github.rest.orgs.listForAuthenticatedUser();
      ({ org } = await inquirer.prompt(
        questions.org(orgs.map(({ login }) => login)),
      ));
    }

    // NOTE: confirm invite with teams
    const { teamIds } = await inquirer.prompt(
      questions.teamIds(async () =>
        (
          await github.rest.teams.list({
            org,
          })
        ).data.map(({ name, id }) => ({ name, value: id })),
      ),
    );

    // NOTE: read invitees from file and check the entry is email or username
    const invitees = readFileLinesAsArray(file);
    const userPromises: Promise<Invitee>[] = invitees.map(async (invitee) =>
      validateEmail(invitee)
        ? ({
            type: "email",
            value: invitee,
          } as const)
        : ({
            type: "invitee_id",
            value: (
              await github.rest.users.getByUsername({
                username: invitee,
              })
            ).data.id,
          } as const),
    );

    const users = await Promise.allSettled(userPromises);
    const validatedUsers = users.reduce<Invitee[]>((acc, user) => {
      switch (user.status) {
        case "fulfilled":
          acc.push(user.value);
          break;
        case "rejected":
          error.write(
            JSON.stringify(
              {
                message: user.reason.message,
                user: user.reason.request.url,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ) + "\n",
          );
          break;
      }
      return acc;
    }, []);

    const invitePromises = validatedUsers.map(async ({ type, value }) =>
      github.rest.orgs.createInvitation({
        org,
        [type]: value,
        team_ids: teamIds,
      }),
    );
  });
