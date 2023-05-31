import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function initServer() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.enableCors();
  await app.listen(3001);
}
initServer();
