import { Module } from '@nestjs/common';
import { WebsocketModule } from './websocket/websocket.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [WebsocketModule, ConfigModule],
})
export class AppModule {}
