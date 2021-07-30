import { Octokit } from "@octokit/core";
import { readFile } from "fs/promises";
require("dotenv").config();

class GitHubClient {
  private readonly octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  public async getUserId(username: string): Promise<number> {
    const user = await this.octokit.request("GET /users/{username}", {
      username,
    });
    return user.data.id as number;
  }

  public async inviteOrganizationMemberByEmail(
    org: string,
    email: string,
  ): Promise<void> {
    await this.octokit.request("POST /orgs/{org}/invitations", {
      org,
      email,
    });
  }

  public async inviteOrganizationMemberById(
    org: string,
    invitee_id: number,
  ): Promise<void> {
    await this.octokit.request("POST /orgs/{org}/invitations", {
      org,
      invitee_id,
    });
  }
}

const validateEmail = (email: string) => /^[\w-\.]+@[\w-\.]+$/i.test(email);

const devideCollectionByFilter = <T>(
  collection: T[],
  filter: (value: T) => boolean,
) =>
  collection.reduce<[T[], T[]]>(
    (accumulator, current) => {
      filter(current)
        ? accumulator[0].push(current)
        : accumulator[1].push(current);
      return accumulator;
    },
    [[], []],
  );

(async () => {
  try {
    const github = new GitHubClient(process.env["GITHUB_TOKEN"] as string);
    const users = (await readFile("./input.txt", "utf8")).trim().split("\n");
    const [userEmailList, usernameList] = devideCollectionByFilter(
      users,
      validateEmail,
    );
    const userIdList = await Promise.all(
      usernameList.map((username) => github.getUserId(username)),
    );

    for await (const userEmail of userEmailList) {
      await github.inviteOrganizationMemberByEmail(
        process.env["ORG"] as string,
        userEmail,
      );
    }

    for await (const userId of userIdList) {
      await github.inviteOrganizationMemberById(
        process.env["ORG"] as string,
        userId,
      );
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
