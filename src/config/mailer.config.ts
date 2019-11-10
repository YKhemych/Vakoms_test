import { HandlebarsAdapter } from '@nest-modules/mailer';

export const mailerConfig = {
  email: 'email@gmail.com',
  password: 'password',
  mailerConfig: {
    transport: `smtps://${this.email}:${this.password}@smtp.gmail.com`,
    template: {
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  },
};
