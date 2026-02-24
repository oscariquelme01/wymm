import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

import 'reflect-metadata' // required by typeorm

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
