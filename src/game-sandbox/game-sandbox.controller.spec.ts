import { Test, TestingModule } from '@nestjs/testing';
import { GameSandboxController } from './game-sandbox.controller';

describe('GameSandboxController', () => {
  let controller: GameSandboxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameSandboxController],
    }).compile();

    controller = module.get<GameSandboxController>(GameSandboxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
