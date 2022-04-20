import { createTransport } from 'nodemailer';
import config from '../config/config';

const fs = require('fs');
const path = require('path');
interface ISendEmailJob {
  text: string;
  email: string;
  subject: string;
  html: string;
  template?: string;
  data?: any; // vars for template
}

const transport = createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465, // true for 465, false for other ports
  auth: {
    user: config.email.user,
    pass: config.email.password
  },
  tls: { rejectUnauthorized: false }
});

export default async (payload: ISendEmailJob) => {
  let html = payload.template 
  ? fs.readFileSync(path.join(__dirname, '..', '..', '..', 'src', 'server', 'store', 'email-templates', `${payload.template}.html`), 'utf8') 
  : payload.html;
  
  if (payload.template && payload.data) {
    for (const param in payload.data) {
      const regex = new RegExp(`%%${param}%%`, 'g');
      html = html.replace(regex, payload.data[param]);
    }
  }

  const res = await transport.sendMail({
    from: config.email.user,
    to: payload.email,
    subject: payload.subject,
    text: payload.text,
    html: html
  });
};
