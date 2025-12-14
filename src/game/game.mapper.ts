import { Game } from "./game.entity";

export class GameMapper {
  public static toDTO(entity: Game): any {
    return {
      id: entity.id,
      name: entity.name,
      userId: entity.userId,
      createdAt: entity.createdAt,
      isInitialized: entity.isInitialized,
    };
  }
}
