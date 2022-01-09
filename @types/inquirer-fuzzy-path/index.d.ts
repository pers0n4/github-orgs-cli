declare module "inquirer-fuzzy-path" {
  import type * as inquirer from "inquirer";

  const prompt: inquirer.prompts.PromptConstructor;

  export = prompt;
}
