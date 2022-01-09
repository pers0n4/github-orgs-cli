declare module "inquirer-search-checkbox" {
  import type * as inquirer from "inquirer";

  const prompt: inquirer.prompts.PromptConstructor;

  export = prompt;
}
