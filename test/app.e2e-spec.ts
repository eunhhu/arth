import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const pin = process.env.PIN || '0000';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule.forRoot(pin)],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/pin (GET)', () => {
    const pin = process.env.PIN || '0000';
    return request(app.getHttpServer())
      .get(`/pin?q=${pin}`)
      .expect(200)
      .expect('success');
  });
});
