import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestRepository } from './test.repository';
import { TestService } from './test.service';

@Module({
  providers: [TestService, TestRepository],
  controllers: [TestController],
})
export class TestModule {}
