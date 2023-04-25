import { Controller, Get, Post } from '@nestjs/common';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  async test(test: string) {
    console.log('controller');
    return await this.testService.test(test);
  }

  @Get()
  async findAlltest() {
    return await this.testService.findAlltest();
  }
}
