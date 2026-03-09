import { Module } from '@nestjs/common';
import { CONFIGURATION, TConfiguration } from '../configuration';
import { ConfigModule } from '@nestjs/config';
import { KeycloakModule } from './keycloak/keycloak.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [() => CONFIGURATION] }), KeycloakModule],
})
export class AppModule {
  static CONFIGURATION: TConfiguration = CONFIGURATION;
}
