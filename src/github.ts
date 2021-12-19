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

class GitHubError extends Error {
  constructor(error: Error) {
    super(error.message);

    Error.captureStackTrace?.(this, GitHubError);
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Method<T> = T extends (...args: any[]) => Promise<any>
  ? (...args: any[]) => Promise<any>
  : (...args: any[]) => any;
type Constructor = { new (...args: any[]): any };
/* eslint-enable */

function ErrorMethod<T>(
  target: T,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<Method<T>>,
) {
  if (!descriptor) {
    descriptor = Object.getOwnPropertyDescriptor(
      target,
      propertyKey,
    ) as TypedPropertyDescriptor<Method<T>>;
  }
  const { value: method } = descriptor;

  descriptor.value = async function (...args: any[]) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await method?.apply(this, args);
    } catch (error) {
      if (error instanceof Error) {
        throw new GitHubError(error);
      }
    }
  };

  return descriptor;
}

function ErrorClass<T extends Constructor>(constructor: T) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);

  for (const key of Object.getOwnPropertyNames(constructor.prototype)) {
    const descriptor = Object.getOwnPropertyDescriptor(
      constructor.prototype,
      key,
    ) as TypedPropertyDescriptor<Method<T>>;
    const decoratedMethod = ErrorMethod<T>(
      constructor.prototype as T,
      key,
      descriptor,
    );
    Object.defineProperty(constructor.prototype, key, decoratedMethod);
  }
}

@ErrorClass
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

  public async inviteUserToOrganizationMember({
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

  public async inviteUserToRepositoryCollaborator(
    owner: string,
    repo: string,
    username: string,
  ) {
    await this.octokit.rest.repos.addCollaborator({
      owner,
      repo,
      username,
    });
  }

  public async getRateLimit() {
    const { data: limits } = await this.octokit.rest.rateLimit.get();

    return limits;
  }
}
