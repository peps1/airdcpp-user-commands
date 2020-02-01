'use strict';

// This example script will reject incoming chat messages containing unwanted words
// Additionally it provides handling for outgoing chat commands that can also be used to
// add/remove ignored words (note that changes are not persisted when reloading the script)

import os from 'os';
import * as Utils from './utils';

// MODULE
export default (socket, extension) => {

  const onOutgoingHubMessage = (message, accept) => {
    const statusMessage = checkChatCommand(message, 'hub');
    if (statusMessage) {
      printStatusMessage(message, statusMessage, 'hub');
    }

    accept();

  };

  const onOutgoingPrivateMessage = (message, accept) => {
    const statusMessage = checkChatCommand(message, 'private');
    if (statusMessage) {
      printStatusMessage(message, statusMessage, 'private');
    }

    accept();

  };

  const printStatusMessage = (message, statusMessage, type) => {
    if (type === 'hub') {
      try {
        socket.post('hubs/status_message', {
          hub_urls: [ message.hub_url ],
          text: statusMessage,
          severity: 'info',
        });
      } catch (e) {
        printEvent(`Failed to send: ${e}`, 'error');
      }
    } else {
      try {
        socket.post(`private_chat/${message.user.cid}/status_message`, {
          hub_urls: [ message.hub_url ],
          text: statusMessage,
          severity: 'info',
        });
      } catch (e) {
        printEvent(`Failed to send: ${e}`, 'error');
      }
    }

  };

  const printEvent = (eventMessage, severity) => {
    socket.post('events', {
      text: `${eventMessage}`,
      severity,
    });
  };

  const sendMessage = async (message, output, type) => {

    if (type === 'hub') {

      try {
        socket.post('hubs/chat_message', {
          hub_urls: [message.hub_url],
          text: output,
        });

      } catch (e) {
        printEvent(`Failed to send: ${e}`, 'error');
      }

    } else {

      try {
        socket.post('private_chat/chat_message', {
          user: {
            hub_url: message.user.hub_url,
            cid: message.user.cid,
          },
          text: output,
          echo: true,
        });
      } catch (e) {
        printEvent(`Failed to send: ${e}`, 'error');
      }

    }
  };

  const getRatio = async () => {
    const results = await socket.get('transfers/tranferred_bytes');

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

  const printRatioSession = async (message, type) => {
    const ratio = await getRatio();
    const output = `Ratio Session: ${ratio.session_ratio} (Uploaded: ${ratio.session_uploaded} | Downloaded: ${ratio.session_downloaded} )`;

    sendMessage(message, output, type);

  };

  const printRatioTotal = async (message, type) => {
    const ratio = await getRatio();
    const output = `Ratio Total: ${ratio.total_ratio} (Uploaded: ${ratio.total_uploaded} | Downloaded: ${ratio.total_downloaded} )`;

    sendMessage(message, output, type);

  };

  const printFullStats = async (message, type) => {
    const sysinfoResults = await socket.get('system/system_info');
    const uptime = sysinfoResults.client_started;
    const clientv = sysinfoResults.client_version;
    const osInfoResult = Utils.getOsInfo();
    const osInfo = osInfoResult[0];
    const osInfoErr = osInfoResult[1];
    const ratio = await getRatio();
    const output = `
  -=[ ${clientv} http://www.airdcpp.net ]=-
  -=[ Uptime: ${Utils.formatUptime(Utils.clientUptime(uptime))} ]=-
  -=[ Ratio Session: ${ratio.session_ratio} (Uploaded: ${ratio.session_uploaded} | Downloaded: ${ratio.session_downloaded} ) ]=-
  -=[ Ratio Total: ${ratio.total_ratio} (Uploaded: ${ratio.total_uploaded} | Downloaded: ${ratio.total_downloaded} ) ]=-
  -=[ OS: ${osInfo} (Uptime: ${Utils.formatUptime(os.uptime())}) ]=-
  -=[ CPU: ${os.cpus()[0].model} ]=-
    `;

    sendMessage(message, output, type);
    if (osInfoErr.length !== 0) {
      printEvent(`Error when getting OS info: ${osInfoErr}`, 'error');
    }

  };

  const printUptime = async (message, type) => {
    const results = await socket.get('system/system_info');
    const uptime = results.client_started;
    const output = `
-=[ Uptime: ${Utils.formatUptime(Utils.clientUptime(uptime))} ]=-
-=[ System Uptime: ${Utils.formatUptime(os.uptime())} ]=-
    `;

    sendMessage(message, output, type);

  };

  const printVersion = async (message, type) => {
    const output = process.env.npm_package_version;

    //sendMessage(message, `Extension Version: ${output}`, type);
    printStatusMessage(message, `Extension Version: ${output}`, type);

  };

  const listShare = async (message) => {
    const command = message.text.split(' ');
    if (command.length === 3) {
      const username = command[1];
      const listDir = command[2];
      const userResults = await socket.post('users/search_nicks', {
        pattern: username,
        max_results: 1,
      });

      try {
        const fileResults = await socket.post('filelists', {
          user: {
            cid: userResults[0].cid,
            hub_url: userResults[0].hub_url,
          },
          directory: listDir,
        });

      } catch (e) {
        if (e.code === 409) {
          const allFilelists = await socket.get('filelists');
          allFilelists.forEach(async (filelist) => {
            if (filelist.user.cid === userResults[0].cid) {
              const userFilelist = await socket.get(`filelists/${filelist.id}`);
              console.log(userFilelist);
            }
          });

        } else {
          // printStatusMessage(message, e.toString());
          printEvent(`File results: ${e.code} - ${e.message}`, 'info');
        }

      }
      // printStatusMessage(message, file_results.state.time_finished.toString());
      // printEvent(`File results: ${file_results.state.time_finished.toString()}`, 'info');

    } else {
      printEvent('Missing parameter, needs username and directory path.', 'error');
    }

  };

  // Basic chat command handling, returns possible status message to post
  const checkChatCommand = (message, type) => {
    const text = message.text;
    if (text.length === 0 || text[0] !== '/') {
      return null;
    }

    if (text === '/help') {
      return `

    User commands

    /uptime\t\tShow uptime (Client & System)\t\t\t(public, visible to everyone)
    /stats\t\tShow various stats (Client, Uptime, Ratio, CPU)\t\t\t(public, visible to everyone)
    /ratio\t\tShow Upload/Download stats\t\t\t(public, visible to everyone)
    /sratio\t\tShow Session Upload/Download stats\t\t\t(public, visible to everyone)
    /version\t\tShow user-commands extension version\t\t\t(private, visible only to yourself)

      `;
    } else if (text === '/sratio') {
        printRatioSession(message, type);
        return null;
    } else if (text === '/ratio') {
        printRatioTotal(message, type);
        return null;
    } else if (text === '/stats') {
        printFullStats(message, type);
        return null;
    } else if (text === '/uptime') {
        printUptime(message, type);
        return null;
    } else if (text === '/version') {
        printVersion(message, type);
        return null;
    } else if (text.startsWith('/list ')) {
        listShare(message);
        return null;
    }

    return null;
  };

  extension.onStart = async () => {

    const subscriberInfo = {
      id: 'chat_commands',
      name: 'Chat commands',
    };

    socket.addHook('hubs', 'hub_outgoing_message_hook', onOutgoingHubMessage, subscriberInfo);
    socket.addHook('private_chat', 'private_chat_outgoing_message_hook', onOutgoingPrivateMessage, subscriberInfo);
  };
};
