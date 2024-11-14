import { ValidationPipe } from '@nestjs/common';
import { MessageBody } from '@nestjs/websockets';

export const WebsocketBody = () => MessageBody(ValidationPipe);
