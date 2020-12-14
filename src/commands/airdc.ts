import { sendChatMessage } from '../chat';
import * as Utils from '../utils';

export const printAirdcVersion = async (type: string, entityId: string|number) => {
  const sysinfoResults: any = await global.SOCKET.get('system/system_info');
  const uptime = sysinfoResults.client_started;
  const clientv = sysinfoResults.client_version;

  const output = `-=[ ${clientv} (Uptime: ${Utils.formatUptime(Utils.clientUptime(uptime))}) ]=-`;

  sendChatMessage(output, type, entityId);
};
