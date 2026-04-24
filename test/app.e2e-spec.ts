import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const pin = process.env.PIN || '0000';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule.forRoot(pin)],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/pin (GET)', () => {
    const pin = process.env.PIN || '0000';
    return request(app.getHttpServer())
      .get(`/pin?q=${pin}`)
      .expect(200)
      .expect('success');
  });
});
