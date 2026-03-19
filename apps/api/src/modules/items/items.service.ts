import type { ItemCategory, ItemSummary } from "@swapsphere/shared";

import { AppError } from "../../lib/app-error.js";
import type { ItemsRepository } from "./items.repository.js";

export interface ItemsServiceContract {
  getItemsByOwner: (ownerId: string, category?: ItemCategory) => Promise<ItemSummary[]>;
}

export class ItemsService implements ItemsServiceContract {
  public constructor(private readonly itemsRepository: ItemsRepository) {}

  public async getItemsByOwner(ownerId: string, category?: ItemCategory): Promise<ItemSummary[]> {
    const owner = await this.itemsRepository.findUserById(ownerId);

    if (!owner) {
      throw new AppError(404, "USER_NOT_FOUND", "Utilisateur introuvable");
    }

    return this.itemsRepository.findItemsByOwner(owner.id, category);
  }
}
