import { Octokit } from "octokit";

import type { Endpoints } from "@octokit/types";

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys] &
  Omit<T, Keys>;

export type RequireExactlyOne<T, Keys extends keyof T = keyof T> = {
  [K in Keys]-?: Required<Pick<T, K>> &
    Partial<Record<Exclude<Keys, K>, never>>;
}[Keys] &
  Omit<T, Keys>;

type CreateInvitationParameters =
  Endpoints["POST /orgs/{org}/invitations"]["parameters"];

export class GitHub {
  private readonly octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  public async getAuthenticatedUser() {
    const { data: user } = await this.octokit.rest.users.getAuthenticated();

    return user;
  }

  public async getUserIdByUsername(username: string) {
    const { data: user, status } = await this.octokit.rest.users.getByUsername({
      username,
    });

    if (status !== 200) {
      throw new Error(`Failed to get user id for ${username}`);
    }

    return user.id as number;
  }

  public async listOrganizationsForAuthenticatedUser() {
    const { data: orgs } =
      await this.octokit.rest.orgs.listForAuthenticatedUser();

    return orgs;
  }

  public async listTeamsOfOrganization(org: string) {
    const { data: teams } = await this.octokit.rest.teams.list({
      org,
    });

    return teams;
  }

  public async inviteToOrganizationMember({
    org,
    invitee_id,
    email,
    team_ids,
  }: RequireExactlyOne<CreateInvitationParameters, "email" | "invitee_id">) {
    await this.octokit.rest.orgs.createInvitation({
      org,
      invitee_id,
      email,
      team_ids,
    });
  }

  public async getRateLimit() {
    const { data: limits } = await this.octokit.rest.rateLimit.get();

    return limits;
  }
}
