import { HandlebarsAdapter } from '@nest-modules/mailer';

export const mailSettings = {
  email: 'email@gmail.com',
  password: 'password',
};

export const mailerConfig = {
  transport: `smtps://${mailSettings.email}:${mailSettings.password}@smtp.gmail.com`,
  template: {
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
};
