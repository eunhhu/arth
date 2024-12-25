import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import fastifyMultipart from '@fastify/multipart';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  const fastifyInstance = app.getHttpAdapter().getInstance();

  fastifyInstance.register(fastifyMultipart as any, { attachFieldsToBody: true });
  fastifyInstance.register(fastifySwagger as any, {
    swagger: {
      info: {
        title: 'Cloud File Service',
        description: 'API documentation for the Cloud File Service',
        version: '1.0',
      },
    },
  });
  fastifyInstance.register(fastifySwaggerUi as any, {
    routePrefix: '/docs',
    initOAuth: {},
    uiConfig: {
      docExpansion: 'none',
      deepLinking: false,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
