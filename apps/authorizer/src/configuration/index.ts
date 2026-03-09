import { BaseConfiguration } from '@common/configuration/base.config';
import { TcpConfiguration } from '@common/configuration/tcp.config';
import { AppConfiguration } from '@common/configuration/app.config';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { KeycloakConfiguration } from '@common/configuration/keycloak.config';

class Configuration extends BaseConfiguration {
  @ValidateNested()
  @Type(() => AppConfiguration)
  APP_CONFIG = new AppConfiguration();

  @ValidateNested()
  @Type(() => TcpConfiguration)
  TCP_SERV = new TcpConfiguration();

  @ValidateNested()
  @Type(() => KeycloakConfiguration)
  KEYCLOAK_CONFIG = new KeycloakConfiguration();
}

export const CONFIGURATION = new Configuration();
export type TConfiguration = typeof CONFIGURATION;

CONFIGURATION.validate();
