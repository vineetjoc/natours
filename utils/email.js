const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const nodemailerSendgrid = require('nodemailer-sendgrid');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = `Vineet Joshi <${process.env.EMAIL_FROM}>`;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
  }

  newTransport() {
    // console.log(process.env.NODE_ENV === 'production');
    // console.log(process.env.SENDGRID_PASS);
    if (process.env.NODE_ENV === 'production')
      return nodemailer.createTransport(
        {
          service: 'SendGrid',
          auth: {
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASS,
          },
        }
        // nodemailerSendgrid({
        //   apiKey: process.env.SENDGRID_PASS,
        // })
      );
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours');
  }

  async resetPassword() {
    await this.send('resetPassword', 'Reset Your Password');
  }
};

//below was for development

// const sendEmail = async (options) => {
//   //creating a transporter
//   // const transporter = nodemailer.createTransport({
//   //   host: 'smtp.mailtrap.io',
//   //   port: 2525,
//   //   auth: {
//   //     user: '1aa32296b33c00',
//   //     pass: 'd3049ae6c7456f',
//   //   },
//   // });
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
//   //   console.log(process.env.EMAIL_PASSWORD, process.env.EMAIL_USERNAME);
//   //define the email options
//   const mailOptions = {
//     from: 'Vineet Joshi <vineetjoc231@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };
//   //now send the email
//   //   console.log('before sending mail');

//   await transporter.sendMail(mailOptions);
//   console.log('after sending email');
// };
// module.exports = sendEmail;
