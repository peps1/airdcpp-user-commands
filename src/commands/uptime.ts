import os from 'os';
import * as Utils from '../utils';
import { sendChatMessage } from '../chat';

// /uptime command
export const printUptime = async (type: string, entityId: string|number) => {
  const results: any = await globalThis.SOCKET.get('system/system_info');
  const uptime = results.client_started;
  const output = `
-=[ Uptime: ${Utils.formatUptime(Utils.clientUptime(uptime))} ]=-
-=[ System Uptime: ${Utils.formatUptime(os.uptime())} ]=-
  `;

  sendChatMessage(output, type, entityId);

};
