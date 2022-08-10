const nodemailer = require('nodemailer');

require('dotenv').config();
const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
const GOOGLE_PASS = process.env.GOOGLE_PASS;

const sendEmailMessage = async (email, CODE) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // 이메일
    auth: {
      user: GOOGLE_EMAIL, // 발송자 이메일
      pass: GOOGLE_PASS, // 발송자 비밀번호
    },
  });
  const mailOptions = {
    from: 'no-reply@stepn.com',
    to: email,
    subject: '[BETBIT] CONFIRM_MAIL',
    html: `<h1>[BETBIT] CONFIRM_MAIL</h1>
    <h3>Your STEPN verification code is: ${CODE}.</h3>
    <h3>Please complete the account verification process in 10 minutes.</h3>
    `,
    // text: ``,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmailMessage };
