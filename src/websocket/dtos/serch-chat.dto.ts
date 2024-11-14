import { IsInt, Min } from 'class-validator';

export class SearchChatRequestDto {
  @IsInt()
  @Min(0)
  topicChatIndex: number;

  @IsInt()
  @Min(0)
  yourGenderChatIndex: number;

  @IsInt()
  @Min(0)
  partnerGenderChatIndex: number;

  @IsInt()
  @Min(0)
  yourAgeChatIndex: number;

  @IsInt({ each: true })
  @Min(0, { each: true })
  partnerAgeChatIndexes: number[];
}
