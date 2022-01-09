declare module "inquirer-search-list" {
  import type * as inquirer from "inquirer";

  const prompt: inquirer.prompts.PromptConstructor;

  export = prompt;
}
