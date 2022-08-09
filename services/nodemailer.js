const nodemailer = require('nodemailer');

require('dotenv').config();
const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
const GOOGLE_PASS = process.env.GOOGLE_PASS;

const sendEmailMessage = async (email) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // 이메일
    auth: {
      user: GOOGLE_EMAIL, // 발송자 이메일
      pass: GOOGLE_PASS, // 발송자 비밀번호
    },
  });
  const mailOptions = {
    from: GOOGLE_EMAIL,
    to: email,
    subject: 'BINARY_CONFIRM_MAIL',
    html: `<h1>BINARY_CONFIRM_MAIL</h1>`,
    text: 'HELLO',
  };
  await transporter.sendMail(mailOptions);
};
