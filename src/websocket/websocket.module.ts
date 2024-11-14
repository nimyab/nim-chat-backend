import { Module } from '@nestjs/common';
import { WebsocketController } from './websocket.controller';

@Module({
  providers: [WebsocketController],
})
export class WebsocketModule {}
