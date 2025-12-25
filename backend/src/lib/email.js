if (!process.env.SENDGRID_API_KEY) {
  console.error(
    '[EMAIL] ⚠️  WARNING: SENDGRID_API_KEY not set. Email sending will fail.'
  );
} else {
  console.log('[EMAIL] ✅ SendGrid REST API configured');
}

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

  const htmlContent = `
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
  `;

  const textContent = `
Reset Your Password - YSC Lunch Soccer

You requested to reset your password for your YSC Lunch Soccer account.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
  `;

  const sendGridUrl = 'https://api.sendgrid.com/v3/mail/send';
  const sendGridPayload = {
    personalizations: [
      {
        to: [{ email }],
        subject: 'Reset Your Password - YSC Lunch Soccer',
      },
    ],
    from: { email: fromEmail },
    content: [
      {
        type: 'text/plain',
        value: textContent.trim(),
      },
      {
        type: 'text/html',
        value: htmlContent.trim(),
      },
    ],
  };

  try {
    const response = await fetch(sendGridUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendGridPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { message: errorText };
      }

      const error = new Error(
        `SendGrid API error: ${response.status} ${response.statusText}`
      );
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }

    console.log(
      `[EMAIL] ✅ Password reset email sent successfully to ${email}`
    );
    return true;
  } catch (error) {
    console.error('[EMAIL] ❌ Error sending email:', error);
    if (error.details) {
      console.error('[EMAIL] Error details:', error.details);
    }
    if (error.status) {
      console.error('[EMAIL] HTTP status:', error.status);
    }
    throw error;
  }
}
