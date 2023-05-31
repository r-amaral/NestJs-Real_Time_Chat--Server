import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { Module } from "@nestjs/common";
import { AppGateway } from "./server/app.gateway";

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot()],
  providers: [AppGateway],
})
export class AppModule {}
