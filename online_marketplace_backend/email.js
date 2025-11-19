import nodemailer from "nodemailer";

// TODO: move these to environment variables later
const EMAIL_USER = "oopsproject404@gmail.com";
const EMAIL_PASS = "rice twtr qkbx deau"; // NOT your normal password

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function sendOtpEmail(toEmail, otpCode) {
  const mailOptions = {
    from: `"OOPMart" <${EMAIL_USER}>`,
    to: toEmail,
    subject: "Your OOPMart verification code",
    text: `Your verification code is: ${otpCode}. It will expire in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
}
