import twilio from 'twilio';
import 'dotenv/config';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNum = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

async function createMessage() {
  const message = await client.messages.create({
    body: 'This is a testing message',
    from: twilioNum,
    to: '+14848600997',
  });

  console.log(message.body);
}

createMessage();
