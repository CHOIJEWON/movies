import { PrismaClient } from '@prisma/client';

export class TestRepository {
  prisma = new PrismaClient();

  async createTest(test: string) {
    const create = await this.prisma.test.create({
      data: {
        test: test,
      },
    });

    console.log(create);
    return create;
  }

  async findTest() {
    return await this.prisma.test.findMany();
  }
}
