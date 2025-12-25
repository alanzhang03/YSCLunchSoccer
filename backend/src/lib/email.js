import nodemailer from 'nodemailer';

if (!process.env.SENDGRID_API_KEY) {
  console.error(
    '[EMAIL] ⚠️  WARNING: SENDGRID_API_KEY not set. Email sending will fail.'
  );
}

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
  greetingTimeout: 10000,
});

console.log('[EMAIL] ✅ SendGrid email service configured');

export async function sendPasswordResetEmail(email, resetLink) {
  if (!process.env.SENDGRID_API_KEY) {
    const error = new Error('SendGrid API key not set (SENDGRID_API_KEY)');
    console.error('[EMAIL] Configuration error:', error.message);
    throw error;
  }

  const fromEmail = process.env.EMAIL_FROM || process.env.SENDGRID_FROM_EMAIL;

  if (!fromEmail) {
    const error = new Error(
      'EMAIL_FROM or SENDGRID_FROM_EMAIL environment variable must be set'
    );
    console.error('[EMAIL] Configuration error:', error.message);
    throw error;
  }

  const mailOptions = {
    from: fromEmail,
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
