import { SearchChatRequestDto } from './dtos/serch-chat.dto';

export type SearcherType = {
  clientSocketId: string;
  searchParams: SearchChatRequestDto;
};

export type SendMessageResponse = {
  id: string;
  text: string;
  sender: string;
};

export type FoundChatResponse = {
  chatId: string;
};

export type ExitOnChatResponse = {
  chatId: string;
};
