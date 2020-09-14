
class EmailService {
  static smtpConfigOptionsSendgrid() {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    return sgMail;
  }

  send(mailOptions) {
    return new Promise((resolve, reject) => {
      try {
        this.constructor.smtpConfigOptionsSendgrid().send(mailOptions);
        return resolve(true);
      } catch (err) {
        return reject(err);
      }
    });
  }
}

module.exports = EmailService;
