import type { UserSummary } from "@swapsphere/shared";

import { prisma } from "../../lib/prisma.js";

export type UserRecord = UserSummary;

export interface UsersRepository {
  listUsers: () => Promise<UserRecord[]>;
  findUserById: (userId: string) => Promise<UserRecord | null>;
}

export class PrismaUsersRepository implements UsersRepository {
  public async listUsers(): Promise<UserRecord[]> {
    const users = await prisma.user.findMany({
      orderBy: {
        displayName: "asc"
      }
    });

    return users.map((user) => ({
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    }));
  }

  public async findUserById(userId: string): Promise<UserRecord | null> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    };
  }
}
