import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000, 
  socketTimeout: 10000,
  greetingTimeout: 10000, 
  pool: true,
  maxConnections: 1,
  maxMessages: 3,
});

export async function sendPasswordResetEmail(email, resetLink) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const error = new Error('Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
    console.error('[EMAIL] Configuration error:', error.message);
    throw error;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Password - YSC Lunch Soccer',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1f73b7;">Reset Your Password</h2>
        <p>You requested to reset your password for your YSC Lunch Soccer account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="display: inline-block; padding: 12px 24px; background-color: #1f73b7; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetLink}</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `
Reset Your Password - YSC Lunch Soccer

You requested to reset your password for your YSC Lunch Soccer account.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    `,
  };

  try {
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Email send timeout after 15 seconds')),
        15000
      );
    });

    await Promise.race([sendPromise, timeoutPromise]);
    console.log(`Password reset email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Email error details:', {
      code: error.code,
      response: error.response,
      responseCode: error.responseCode,
      command: error.command,
    });
    throw error;
  }
}
