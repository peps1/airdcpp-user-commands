import os from 'os'
import * as Utils from '../utils'
import { printEvent } from '../log'
import { sendChatMessage } from '../chat'

const getRatio = async () => {
  const results: any = await globalThis.SOCKET.get('transfers/tranferred_bytes');

  // Total Stats
  // For some reason the start_total_* values are not beeing updated after the client starts
  // so we have to add the current session_* values to that.
  const totalDownloaded = Utils.formatSize(results.start_total_downloaded + results.session_downloaded);
  const totalUploaded = Utils.formatSize(results.start_total_uploaded + results.session_uploaded);
  const totalRatio = ((results.start_total_uploaded + results.session_uploaded) / (results.start_total_downloaded + results.session_downloaded)).toFixed(2);
  // Session Stats
  const sessionDownloaded = Utils.formatSize(results.session_downloaded);
  const sessionUploaded = Utils.formatSize(results.session_uploaded);
  const sessionRatio = (results.session_uploaded / results.session_downloaded).toFixed(2);

  const ratio = {
    total_downloaded: totalDownloaded,
    total_uploaded: totalUploaded,
    total_ratio: totalRatio,
    session_downloaded: sessionDownloaded,
    session_uploaded: sessionUploaded,
    session_ratio: sessionRatio,
  };

  return ratio;
};

// /sratio command
export const printRatioSession = async (type: string, entityId: string|number) => {
  const ratio = await getRatio();
  const output = `Ratio Session: ${ratio.session_ratio} (Uploaded: ${ratio.session_uploaded} | Downloaded: ${ratio.session_downloaded} )`;

  sendChatMessage(output, type, entityId);

};

// /ratio command
export const printRatioTotal = async (type: string, entityId: string|number) => {
  const ratio = await getRatio();
  const output = `Ratio Total: ${ratio.total_ratio} (Uploaded: ${ratio.total_uploaded} | Downloaded: ${ratio.total_downloaded} )`;

  sendChatMessage(output, type, entityId);

};

// /stats command
export const printFullStats = async (type: string, entityId: string|number) => {
  const sysinfoResults: any = await globalThis.SOCKET.get('system/system_info');
  const uptime = sysinfoResults.client_started;
  const clientv = sysinfoResults.client_version;
  const osInfoResult = Utils.getOsInfo();
  const osInfo = osInfoResult[0];
  const osInfoErr = osInfoResult[1];
  const ratio = await getRatio();
  const output = `
-=[ ${clientv} https://airdcpp-web.github.io/ ]=-
-=[ Uptime: ${Utils.formatUptime(Utils.clientUptime(uptime))} ]=-
-=[ Ratio Session: ${ratio.session_ratio} (Uploaded: ${ratio.session_uploaded} | Downloaded: ${ratio.session_downloaded} ) ]=-
-=[ Ratio Total: ${ratio.total_ratio} (Uploaded: ${ratio.total_uploaded} | Downloaded: ${ratio.total_downloaded} ) ]=-
-=[ OS: ${osInfo} (Uptime: ${Utils.formatUptime(os.uptime())}) ]=-
-=[ CPU: ${os.cpus()[0].model} ]=-
  `;

  sendChatMessage(output, type, entityId);

  if (osInfoErr.length !== 0) {
    printEvent(`Error when getting OS info: ${osInfoErr}`, 'error');
  }

};
