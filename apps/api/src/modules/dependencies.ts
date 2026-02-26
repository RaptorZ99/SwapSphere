import { PrismaItemsRepository } from "./items/items.repository.js";
import { ItemsService, type ItemsServiceContract } from "./items/items.service.js";
import { PrismaTradesRepository } from "./trades/trades.repository.js";
import { TradesService, type TradesServiceContract } from "./trades/trades.service.js";
import { PrismaUsersRepository } from "./users/users.repository.js";
import { UsersService, type UsersServiceContract } from "./users/users.service.js";

export type AppDependencies = {
  usersService: UsersServiceContract;
  itemsService: ItemsServiceContract;
  tradesService: TradesServiceContract;
};

export const createDefaultDependencies = (): AppDependencies => {
  const usersService = new UsersService(new PrismaUsersRepository());
  const itemsService = new ItemsService(new PrismaItemsRepository());
  const tradesService = new TradesService(new PrismaTradesRepository());

  return {
    usersService,
    itemsService,
    tradesService
  };
};
