#!/usr/bin/env node
import cli from "./cli/index.js";
import { readPackageJson } from "./utils.js";

(function () {
  const { version, name } = readPackageJson();
  cli
    .name(name)
    .version(version)
    .description("A command line tool for inviting users to an organization")
    .showHelpAfterError()
    .showSuggestionAfterError()
    .parse(process.argv);
})();
