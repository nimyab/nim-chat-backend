import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(WsException, HttpException)
export class WebSocketExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(WebSocketExceptionFilter.name);

  catch(exception: WsException | HttpException, host: ArgumentsHost) {
    const socket = host.switchToWs().getClient();
    const data = host.switchToWs().getData();
    const error =
      exception instanceof WsException
        ? exception.getError()
        : exception.getResponse();
    const details = error instanceof Object ? { ...error } : { message: error };

    this.logger.error(details.message);

    socket.emit('error', {
      id: (socket as any).id,
      rid: data.rid,
      ...details,
    });
  }
}
