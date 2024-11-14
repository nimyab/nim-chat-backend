import { Injectable } from '@nestjs/common';
import { ConfigService as InternalConfigService } from '@nestjs/config';

type Config = {
  PORT: string;
};

@Injectable()
export class ConfigService extends InternalConfigService<Config, true> {}
