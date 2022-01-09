import { Command } from "commander";

import {
  organizationInvitationCommand,
  rateLimitCommand,
  repositoryInvitationCommand,
} from "./commands.js";

const program = new Command();

program
  .addCommand(organizationInvitationCommand(), { isDefault: true })
  .addCommand(repositoryInvitationCommand())
  .addCommand(rateLimitCommand());

export default program;
