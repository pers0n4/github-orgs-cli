import { Command } from "commander";

import { organizationInvitationCommand } from "./commands.js";

const program = new Command();

program.addCommand(organizationInvitationCommand(), { isDefault: true });

export default program;
