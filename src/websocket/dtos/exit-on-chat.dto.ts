import { IsUUID } from 'class-validator';

export class ExitOnChatRequest {
  @IsUUID()
  chatId: string;
}
