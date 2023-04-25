import { HttpException, Injectable } from '@nestjs/common';
import { TestRepository } from './test.repository';

@Injectable()
export class TestService {
  constructor(private readonly testRepository: TestRepository) {}

  async test(test: string) {
    try {
      console.log('service');
      return await this.testRepository.createTest(test);
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  async findAlltest() {
    try {
      return await this.testRepository.findTest();
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }
}
