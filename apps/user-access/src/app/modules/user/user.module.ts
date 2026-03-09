import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule } from '@nestjs/microservices';
import { UserDestination } from '@common/schemas/user.schema';
import { TCP_SERVICES, TcpProvider } from '@common/configuration/tcp.config';
import { UserRepository } from './repositories/user.repository';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([UserDestination]),
    ClientsModule.registerAsync([TcpProvider(TCP_SERVICES.AUTHORIZER_SERVICE)]),
  ],
  controllers: [UserController],
  providers: [UserRepository, UserService],
})
export class UserModule {}
