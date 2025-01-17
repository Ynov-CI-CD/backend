import { Controller, Get } from '@nestjs/common';
import { Public } from './decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  checkHealth(): string {
    return 'Service is healthy';
  }
}
