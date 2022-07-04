import { Command } from "commander";
import inquirer from "inquirer";
import { checkFileExist, readPackage } from "../helper.js";
import questions from "../questions.js";
import { limit, org } from "./commands/index.js";

const { name, version } = readPackage();

const cli = new Command();

cli
  .name(name)
  .version(version)
  .description("GitHub organization invitation CLI")
  .showHelpAfterError()
  .showSuggestionAfterError();

cli
  .option(
    "--token <token>",
    "GitHub personal access token",
    process.env.GITHUB_TOKEN,
  )
  .option(
    "-f, --file <filename>",
    "specify file containing invitees",
    checkFileExist,
  )
  .hook("preAction", async (command) => {
    let { token } = command.optsWithGlobals();
    if (!token) {
      ({ token } = await inquirer.prompt(questions.token(token)));
      command.setOptionValue("token", token);
    }
  });

cli.addCommand(org, { isDefault: true }).addCommand(limit);

export default cli;
