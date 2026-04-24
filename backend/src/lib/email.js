const RESEND_URL = 'https://api.resend.com/emails';

function getApiKey() {
  if (!process.env.RESEND_API_KEY) {
    const error = new Error('Resend API key not set (RESEND_API_KEY)');
    console.error('[EMAIL] Configuration error:', error.message);
    throw error;
  }
  return process.env.RESEND_API_KEY;
}

async function sendEmail(payload) {
  const apiKey = getApiKey();

  const response = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
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
      `Resend API error: ${response.status} ${response.statusText}`,
    );
    error.status = response.status;
    error.details = errorDetails;
    throw error;
  }

  return true;
}

export async function sendPasswordResetEmail(email, resetLink) {
  const fromEmail = process.env.EMAIL_FROM;

  const html = `
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
  `.trim();

  const text = `
Reset Your Password - YSC Lunch Soccer

You requested to reset your password for your YSC Lunch Soccer account.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
  `.trim();

  try {
    return await sendEmail({
      from: `YSC Lunch Soccer <${fromEmail}>`,
      to: [email],
      subject: 'Reset Your Password - YSC Lunch Soccer',
      html,
      text,
    });
  } catch (error) {
    console.error('[EMAIL] Error sending password reset email:', error.message);
    if (error.details) {
      console.error('[EMAIL] Resend error details:', error.details);
    }
    throw error;
  }
}

export async function sendContactFormEmail(senderName, senderEmail, message) {
  const fromEmail = process.env.EMAIL_FROM;
  const adminEmail = process.env.CONTACT_EMAIL || fromEmail;

  if (!fromEmail) {
    const error = new Error('EMAIL_FROM environment variable must be set');
    console.error('[EMAIL] Configuration error:', error.message);
    throw error;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1f73b7;">New Contact Form Submission</h2>
      <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${message}</p>
    </div>
  `.trim();

  const text = `
New Contact Form Submission - YSC Lunch Soccer

From: ${senderName} (${senderEmail})

Message:
${message}
  `.trim();

  try {
    return await sendEmail({
      from: `YSC Lunch Soccer <${fromEmail}>`,
      to: [adminEmail],
      reply_to: `${senderName} <${senderEmail}>`,
      subject: `Contact Form: Message from ${senderName}`,
      html,
      text,
    });
  } catch (error) {
    console.error('[EMAIL] Error sending contact form email:', error.message);
    if (error.details) {
      console.error('[EMAIL] Resend error details:', error.details);
    }
    throw error;
  }
}
