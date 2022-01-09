import { Command } from "commander";

import { organizationInvitationCommand, rateLimitCommand } from "./commands.js";

const program = new Command();

program
  .addCommand(organizationInvitationCommand(), { isDefault: true })
  .addCommand(rateLimitCommand());

export default program;
