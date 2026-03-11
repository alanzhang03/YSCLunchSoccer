import twilio from 'twilio';
import 'dotenv/config';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNum = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

async function sendSms(to, body) {
  for (let i = 0; i < to.length; i++) {
    const message = await client.messages.create({
      body: body,
      from: twilioNum,
      to: to[i].phone,
    });
  }
}

export default sendSms;
