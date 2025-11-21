import { google } from "googleapis";

export async function getGmailClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

export async function getProfile(accessToken: string) {
  const gmail = await getGmailClient(accessToken);
  const profile = await gmail.users.getProfile({ userId: "me" });
  return profile.data;
}

export async function listMessages(
  accessToken: string,
  maxResults: number = 10
) {
  const gmail = await getGmailClient(accessToken);
  const messages = await gmail.users.messages.list({
    userId: "me",
    maxResults,
  });
  return messages.data;
}

export async function getMessage(accessToken: string, messageId: string) {
  const gmail = await getGmailClient(accessToken);
  const message = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });
  return message.data;
}

export async function sendEmail(
  accessToken: string,
  to: string,
  subject: string,
  body: string
) {
  const gmail = await getGmailClient(accessToken);

  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "",
    body,
  ].join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  return result.data;
}

export async function getLabels(accessToken: string) {
  const gmail = await getGmailClient(accessToken);
  const labels = await gmail.users.labels.list({ userId: "me" });
  return labels.data.labels || [];
}
