import { Command, OptionValues } from "commander";
import { Octokit } from "octokit";

export default new Command("limit")
  .description("rate limit")
  .action(async (_options: OptionValues, command: Command) => {
    const { token } = command.optsWithGlobals();
    const github = new Octokit({ auth: token });

    const {
      data: { rate },
    } = await github.rest.rateLimit.get();

    console.info({
      ...rate,
      reset: new Date(rate.reset * 1000),
    });
  });
