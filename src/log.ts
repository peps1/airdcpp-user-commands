declare const EXTENSION_NAME: string;

// https://airdcpp.docs.apiary.io/#reference/private-chat-sessions/methods/send-status-message
// https://airdcpp.docs.apiary.io/#reference/hub-sessions/messages/send-status-message
export const printStatusMessage = (statusMessage: string, type: string, entityId: string|number) => {
  try {
    global.SOCKET.post(`${type}/${entityId}/status_message`, {
      text: statusMessage,
      severity: 'info',
    });
  } catch (e) {
    printEvent(`Failed to send: ${e}`, 'error');
  }

};

// Events are used for displaying and logging informative messages and errors to the application user.
// Note that events are not bind to any specific context; some entities, such as hubs, provide similar
// methods for showing information locally to the application user.
// Messages will appear as popups and in the Events Log
// https://airdcpp.docs.apiary.io/#reference/events
export const printEvent = (eventMessage: string, severity: string) => {
  global.SOCKET.post('events', {
    text: `[${EXTENSION_NAME}] ${eventMessage}`,
    severity,
  });
};
