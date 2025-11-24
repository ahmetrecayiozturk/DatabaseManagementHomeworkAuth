import { Test, TestingModule } from '@nestjs/testing';
import { GameSandboxService } from './game-sandbox.service';

describe('GameSandboxService', () => {
  let service: GameSandboxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameSandboxService],
    }).compile();

    service = module.get<GameSandboxService>(GameSandboxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
