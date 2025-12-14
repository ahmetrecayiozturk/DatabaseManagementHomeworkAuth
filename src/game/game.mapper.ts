
export class GameMapper{
    public static toDTO(entity: any): any {
        return {
            id: entity.id,
            name: entity.name,
            userId: entity.userId,
            createdAt: entity.createdAt,
        };
    }
}