import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [AppService],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
  });

  describe('root', () => {
    it('should return "Service is healthy"', () => {
      expect(healthController.checkHealth()).toBe('Service is healthy');
    });
  });
});
