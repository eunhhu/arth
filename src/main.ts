import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import fastifyMultipart from '@fastify/multipart';
import * as os from 'os';
import { getConfig, isAndroid } from './lib/util';
import { existsSync, mkdirSync } from 'fs';
import { c } from './lib/util';
import * as yargs from 'yargs';

async function bootstrap() {

  const argv = yargs
    .option('port', {
      alias: 'p',
      type: 'number',
      description: 'Port to listen on',
      default: 3000,
    })
    .option('pin', {
      alias: 'n',
      type: 'string',
      description: 'Pin to secure the server',
      default: "0000",
    })
    .help()
    .alias('help', 'h')
    .parseSync();

  const config = getConfig();
  if(!existsSync(config.root)) mkdirSync(config.root, { recursive: true });
  if(!existsSync(config.db)) mkdirSync(config.db, { recursive: true });
  if(!existsSync(config.cloud)) mkdirSync(config.cloud, { recursive: true });
  if(!existsSync(config.home)) mkdirSync(config.home, { recursive: true });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule.forRoot(argv.pin), new FastifyAdapter(), { logger: false });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

  await app.register(fastifyMultipart, {
    limits: {
      fieldNameSize: 100,
      fieldSize: 1000000,
      fields: 10,
      fileSize: 1024 * 1024 * 1024 * 10, // 10 GB
      files: 99,
      headerPairs: 2000,
    }
  });

  await app.listen(argv.port, "0.0.0.0");

  // Display server information
  console.log(c('sky', `========== ARTH ${process.env.npm_package_version} ==========`));
  console.log(c('sky', "Server running on port"), c("yellow", argv.port.toString()), c("sky", "with PIN"), c("yellow", argv.pin));
  console.log(c("lime", "[Platform]"), os.platform());
  console.log(c("lime", "[Arch]"), os.arch());
  console.log(c("lime", "[Machine]"), os.machine());
  console.log(c("lime", "[CPU]"), os.cpus()[0].model || "Unknown");
  console.log(c("lime", "[OS type]"), os.type());
  console.log(c("lime", "[Hostname]"), os.hostname());
  console.log(c("lime", "[Node version]"), process.version);
  if(!isAndroid()) console.warn(c("yellow", "[Warning]"), "This OS is not Android, so some features might not be available.");
}
bootstrap();
