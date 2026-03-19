import type { SelectUserResponse, UserSummary } from "@swapsphere/shared";

import { AppError } from "../../lib/app-error.js";
import type { UsersRepository } from "./users.repository.js";

export interface UsersServiceContract {
  listUsers: () => Promise<UserSummary[]>;
  selectUser: (userId: string) => Promise<SelectUserResponse>;
  ensureUserExists: (userId: string) => Promise<UserSummary>;
}

export class UsersService implements UsersServiceContract {
  public constructor(private readonly usersRepository: UsersRepository) {}

  public async listUsers(): Promise<UserSummary[]> {
    return this.usersRepository.listUsers();
  }

  public async selectUser(userId: string): Promise<SelectUserResponse> {
    await this.ensureUserExists(userId);

    return {
      userId
    };
  }

  public async ensureUserExists(userId: string): Promise<UserSummary> {
    const user = await this.usersRepository.findUserById(userId);

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "Utilisateur introuvable");
    }

    return user;
  }
}
