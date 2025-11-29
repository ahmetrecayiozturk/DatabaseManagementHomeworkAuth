import { SandboxRecordDTO } from "./sandbox-record.dto";

export class SandboxRecordMapper {
    static toDTO(entity: any): SandboxRecordDTO {
        const dto = new SandboxRecordDTO();
        dto.userId = entity.userId;
        dto.name = entity.name;
        dto.id = entity.id;
        dto.createdAt = entity.createdAt;
        dto.status = entity.status;
        return dto;
    }
}