import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigModule as InternalConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [InternalConfigModule.forRoot({ isGlobal: true })],
  providers: [ConfigService],
})
export class ConfigModule {}
