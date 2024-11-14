import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { NestGateway } from '@nestjs/websockets/interfaces/nest-gateway.interface';
import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from './websocket.events';
import { WebsocketBody } from 'src/common/decorators/websocket-body.decorator';
import { SendMessageRequestDto } from './dtos/send-message.dto';
import { SearchChatRequestDto } from './dtos/serch-chat.dto';
import {
  ExitOnChatResponse,
  FoundChatResponse,
  SearcherType,
  SendMessageResponse,
} from './types';
import { v4 as uuidv4 } from 'uuid';
import { Logger, UseFilters } from '@nestjs/common';
import { ExitOnChatRequest } from './dtos/exit-on-chat.dto';
import { WebSocketExceptionFilter } from './websocket.filter';

@WebSocketGateway({ cors: { origin: '*' } })
@UseFilters(WebSocketExceptionFilter)
export class WebsocketController implements NestGateway {
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(WebsocketController.name);

  private searcherQueue = new Array<SearcherType>();

  private chats = new Map<string, string[]>();

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`socket with ${client.id} ID CONNECTED`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`socket with ${client.id} ID DISCONNECTED`);
  }

  @SubscribeMessage(SOCKET_EVENTS.SEND_MESSAGE)
  sendMessage(
    @ConnectedSocket() client: Socket,
    @WebsocketBody() data: SendMessageRequestDto,
  ) {
    const { chatId, text } = data;
    const chat = this.chats.get(chatId);
    if (!chat)
      client.emit(SOCKET_EVENTS.EXIT_ON_CHAT, { chatId } as ExitOnChatResponse);

    const message = {
      id: uuidv4(),
      sender: client.id,
      text,
    } as SendMessageResponse;
    this.logger.log(`${client.id} send message to chat with ${chatId} id`);
    chat.forEach((socketId) => {
      this.server.to(socketId).emit(SOCKET_EVENTS.SEND_MESSAGE, message);
    });
  }

  @SubscribeMessage(SOCKET_EVENTS.SEARCH_CHAT)
  searchChat(
    @ConnectedSocket() client: Socket,
    @WebsocketBody() data: SearchChatRequestDto,
  ) {
    const {
      partnerAgeChatIndexes,
      partnerGenderChatIndex,
      topicChatIndex,
      yourAgeChatIndex,
      yourGenderChatIndex,
    } = data;

    const partner = this.searcherQueue.find((searcher) => {
      const { searchParams } = searcher;
      if (searchParams.topicChatIndex !== topicChatIndex) return false;
      if (
        !(
          yourGenderChatIndex === searchParams.partnerGenderChatIndex &&
          partnerGenderChatIndex === searchParams.yourGenderChatIndex
        )
      )
        return false;

      if (
        !(
          partnerAgeChatIndexes.includes(searchParams.yourAgeChatIndex) &&
          searchParams.partnerAgeChatIndexes.includes(yourAgeChatIndex)
        )
      )
        return false;

      return true;
    });
    if (!partner) {
      this.logger.log(`socket with ${client.id} id not found partner`);
      this.searcherQueue.push({
        clientSocketId: client.id,
        searchParams: data,
      });
      this.logger.log(`socket with ${client.id} id add to searcherQueue`);
      return;
    }

    const newChat = [client.id, partner.clientSocketId];
    const chatId = uuidv4();
    this.chats.set(chatId, newChat);

    this.logger.log(
      `socket with ${client.id} id found partner. create chat with ${chatId} id. partners is ${newChat}`,
    );

    newChat.forEach((socketId) => {
      this.server
        .to(socketId)
        .emit(SOCKET_EVENTS.FOUND_CHAT, { chatId } as FoundChatResponse);
    });
  }

  @SubscribeMessage(SOCKET_EVENTS.STOP_SEARCH_CHAT)
  stopSearchChat(@ConnectedSocket() client: Socket) {
    this.searcherQueue = this.searcherQueue.filter(
      (searcher) => searcher.clientSocketId !== client.id,
    );
    this.logger.log(`${client.id} stop search`);
    client.emit(SOCKET_EVENTS.STOP_SEARCH_CHAT, { message: 'success' });
  }

  @SubscribeMessage(SOCKET_EVENTS.FOUND_CHAT)
  foundChat(@ConnectedSocket() client: Socket) {}

  @SubscribeMessage(SOCKET_EVENTS.EXIT_ON_CHAT)
  exitOnChat(
    @ConnectedSocket() client: Socket,
    @WebsocketBody() data: ExitOnChatRequest,
  ) {
    const { chatId } = data;
    const chat = this.chats.get(chatId);
    if (!chat) return;
    this.logger.log(`${client.id} stop search`);
    chat.forEach((socketId) => {
      this.server
        .to(socketId)
        .emit(SOCKET_EVENTS.EXIT_ON_CHAT, { chatId } as ExitOnChatResponse);
    });
    this.chats.delete(chatId);
  }
}
