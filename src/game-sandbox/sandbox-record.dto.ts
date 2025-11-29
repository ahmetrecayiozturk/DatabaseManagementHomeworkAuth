import { SandboxStatus } from "./sandbox.status.enum"

export class SandboxRecordDTO  {
    id: number
    userId: number
    name: string
    createdAt: Date
    status: SandboxStatus
}
