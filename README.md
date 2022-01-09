# GitHub Organization CLI

[![npm version](https://img.shields.io/npm/v/github-orgs-cli?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/github-orgs-cli)
[![npm downloads](https://img.shields.io/npm/dt/github-orgs-cli?style=flat-square&color=339933)](https://www.npmjs.com/package/github-orgs-cli)
[![license](https://img.shields.io/github/license/pers0n4/github-orgs-cli?style=flat-square&color=181717&logo=github)](https://github.com/pers0n4/github-orgs-cli/blob/main/LICENSE)

## Features

- Invite users to an organization
  - with teams
- Invite users to a repositry

## Installation

### npm

```shell
npm install --global github-orgs-cli
# or
pnpm add --global github-orgs-cli
```

### Local install using Git

```bash
git clone https://github.com/pers0n4/github-orgs-cli.git
cd github-orgs-cli

npm link
# or
pnpm link --global
```

## Usage

```shell
github-orgs-cli --help

github-orgs-cli org [organization] [options] (default)
github-orgs-cli repo [owner/repo] [options]
github-orgs-cli limit

# invite a user to an organization
github-orgs-cli ORG
github-orgs-cli ORG -f invitees.txt
github-orgs-cli org ORG
github-orgs-cli org ORG --file invitees.txt

# invite a user to a repository
github-orgs-cli repo OWNER/REPO
github-orgs-cli repo OWNER/REPO -f invitees.txt
```

## LICENSE

[MIT License](./LICENSE)
