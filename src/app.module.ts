import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { Connection } from 'typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HandlebarsAdapter, MailerModule } from '@nest-modules/mailer';
import { mailerConfig } from './config/mailer.config';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    AuthModule,
    MailerModule.forRoot({
      transport: `smtps://${mailerConfig.email}:${mailerConfig.password}@smtp.gmail.com`,
      template: {
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
})
export class AppModule {
  constructor(private readonly connection: Connection) {}
}
