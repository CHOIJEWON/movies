import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validation } from './commons/utils';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.production.env'
          : process.env.NODE_ENV === 'development'
          ? '.development.env'
          : '.env',
      isGlobal: true,
      validationSchema: validation,
    }),
    TestModule,
  ],
})
export class AppModule {}
