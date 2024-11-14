import { IsString, IsUUID } from 'class-validator';

export class SendMessageRequestDto {
  @IsString()
  readonly text: string;

  @IsUUID()
  readonly chatId: string;
}
