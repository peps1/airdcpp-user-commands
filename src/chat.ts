import { listShare } from './commands/share';
import { printEvent, printStatusMessage } from './log';
import { printNetworkSpeedInfo } from './commands/speed';
import { printOsInfo } from './commands/os';
import { printRatioSession, printRatioTotal, printFullStats } from './commands/stats';
import { printUptime } from './commands/uptime';
import { printVersion } from './commands/version';
import { printUser } from './commands/user';
import { printAirdcVersion } from './commands/airdc';

const helpText = `
        #######################
        User commands
        #######################

        /uptime\tShow uptime (Client & System)\t\t\t(public, visible to everyone)
        /speed\tShow current network Upload/Download speed\t\t\t(public, visible to everyone)
        /os\t\tShow the operating system\t\t\t(public, visible to everyone)
        /airdc\t\tShow AirDC++w version and client uptime \t\t\t(public, visible to everyone)
        /stats\t\tShow various stats (Client, Uptime, Ratio, CPU)\t\t\t(public, visible to everyone)
        /ratio\t\tShow Upload/Download stats\t\t\t(public, visible to everyone)
        /sratio\tShow Session Upload/Download stats\t\t\t(public, visible to everyone)
        /version\tShow user-commands extension version\t\t\t(private, visible only to yourself)
        /user username\tSearch for a user and show the hub user was found on\t\t\t(private, visible only to yourself)
        /list username /share/folder\tList all items within a users shared folder, writing items to local file\t\t\t(private, visible only to yourself)
`;

// Basic chat command handling, returns possible status message to post
// TODO: (legacy, remove at some point)
const checkLegacyChatCommand = async (message: any, type: string) => {
  const text = message.text;
  if (text.length === 0 || text[0] !== '/') {
    return null;
  }

  const command = message.text.split(' ');
  const args = command.slice(1);

  if (text === '/help') {
    printStatusMessage(helpText, type, message.session_id);
  } else if (text === '/airdc') {
    printAirdcVersion(type, message.session_id);
  } else if (text === '/sratio') {
    printRatioSession(type, message.session_id);
  } else if (text === '/ratio') {
    printRatioTotal(type, message.session_id);
  } else if (text === '/stats') {
    printFullStats(type, message.session_id);
  } else if (text === '/uptime') {
    printUptime(type, message.session_id);
  } else if (text === '/speed') {
    const speedInfo = await printNetworkSpeedInfo();
    if (speedInfo) {
      sendChatMessage(speedInfo, type, message.session_id);
    }
  } else if (text === '/os') {
    const osInfo = await printOsInfo();
    if (osInfo) {
      sendChatMessage(osInfo, type, message.session_id);
    }
  } else if (text.startsWith('/user ')) {
    printUser(args, type, message.session_id);
  } else if (text === '/version') {
    printVersion(type, message.session_id);
  } else if (text.startsWith('/list ')) {
    listShare(type, message.session_id, args);
  }

  return null;
};

// entityId is the session_id used to reference the current chat session
// example https://airdcpp.docs.apiary.io/#reference/private-chat-sessions/methods/send-chat-message
const checkChatCommand = async (type: string, data: any, entityId: string|number) => {
  const { command, args } = data;

  switch (command) {
    case 'help': {
      printStatusMessage(helpText, type, entityId);
      break;
    }
    case 'airdc': {
      printAirdcVersion(type, entityId);
      break;
    }
    case 'stats': {
      printFullStats(type, entityId);
      break;
    }
    case 'ratio': {
      printRatioTotal(type, entityId);
      break;
    }
    case 'sratio': {
      printRatioSession(type, entityId);
      break;
    }
    case 'uptime': {
      printUptime(type, entityId);
      break;
    }
    case 'os': {
      const osInfo = await printOsInfo();
      if (osInfo) {
        sendChatMessage(osInfo, type, entityId);
      }
      break;
    }
    case 'speed': {
      const speedInfo = await printNetworkSpeedInfo();
      if (speedInfo) {
        sendChatMessage(speedInfo, type, entityId);
      }
      break;
    }
    case 'user': {
      printUser(args, type, entityId);
      break;
    }
    case 'version': {
      printVersion(type, entityId);
      break;
    }
    case 'list': {
      listShare(type, entityId, args);
      break;
    }
  }

  return null;
};


// https://airdcpp.docs.apiary.io/#reference/hub-sessions/messages/send-chat-message
// https://airdcpp.docs.apiary.io/#reference/private-chat-sessions/methods/send-chat-message
export const sendChatMessage = (chatMessage: string, type: string, entityId: string|number) => {
  try {
    globalThis.SOCKET.post(`${type}/${entityId}/chat_message`, {
      text: chatMessage,
      severity: 'info',
    });
  } catch (e) {
    printEvent(`Failed to send: ${e}`, 'error');
  }

};

export const onChatCommand = async (type: string, data: any, entityId: string|number) => {
  const statusMessage = await checkChatCommand(type, data, entityId);
  if (statusMessage) {
    printStatusMessage(statusMessage, type, entityId);
  }
};

export const onOutgoingHubMessage = (message: any, accept: any) => {
  checkLegacyChatCommand(message, 'hubs');
  accept();
};

export const onOutgoingPrivateMessage = (message: any, accept: any) => {
  checkLegacyChatCommand(message, 'private');
  accept();
};
