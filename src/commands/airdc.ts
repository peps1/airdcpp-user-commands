import { sendChatMessage } from '../chat';

export const printAirdcVersion = async (type: string, entityId: string|number) => {
  const sysinfoResults: any = await global.SOCKET.get('system/system_info');
  const clientv = sysinfoResults.client_version;

  const output = `-=[ ${clientv} https://airdcpp-web.github.io/ ]=-`;

  sendChatMessage(output, type, entityId);
};
