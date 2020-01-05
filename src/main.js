'use strict';

// This example script will reject incoming chat messages containing unwanted words
// Additionally it provides handling for outgoing chat commands that can also be used to
// add/remove ignored words (note that changes are not persisted when reloading the script)

const Utils = require('./utils');
const os		= require('os');

// MODULE
module.exports = function (socket, extension) {

  const onOutgoingHubMessage = (message, accept) => {
    const statusMessage = checkChatCommand(message, "hub");
    if (statusMessage) {
      printStatusMessage(message, statusMessage);
    }

    accept();

  };

  const onOutgoingPrivateMessage = (message, accept) => {
    const statusMessage = checkChatCommand(message, "private");
    if (statusMessage) {
      printStatusMessage(message, statusMessage);
    }

    accept();

  };

  const printStatusMessage = (message, statusMessage) => {
    socket.post('hubs/status_message', {
      hub_urls: [ message.hub_url ],
      text: statusMessage,
      severity: 'info',
    });

  };

  const postEvent = (message, severity) => {
		socket.post('events', {
			text: `${message}`,
			severity,
		});
	};

  const sendMessage = async (message, output, type) => {

    if (type == "hub") {

      try {
        socket.post('hubs/chat_message', {
          hub_urls: [message.hub_url],
          text: output,
        });

      } catch (e) {
        postEvent(`Failed to send: ${e}`, 'error');
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
        postEvent(`Failed to send: ${e}`, 'error');
      }

    }
  }

  const getRatio = async () => {
    const results = await socket.get("transfers/tranferred_bytes");

    // Total Stats
    // For some reason the start_total_* values are not beeing updated after the client starts
    // so we have to add the current session_* values to that.
    const total_downloaded = Utils.formatSize(results.start_total_downloaded + results.session_downloaded);
    const total_uploaded = Utils.formatSize(results.start_total_uploaded + results.session_uploaded);
    const total_ratio = ((results.start_total_uploaded + results.session_uploaded) / (results.start_total_downloaded + results.session_downloaded)).toFixed(2);
    // Session Stats
    const session_downloaded = Utils.formatSize(results.session_downloaded);
    const session_uploaded = Utils.formatSize(results.session_uploaded);
    const session_ratio = (results.session_uploaded / results.session_downloaded).toFixed(2);

    const ratio = {
      "total_downloaded": total_downloaded,
      "total_uploaded": total_uploaded,
      "total_ratio": total_ratio,
      "session_downloaded": session_downloaded,
      "session_uploaded": session_uploaded,
      "session_ratio": session_ratio,
    };

    return ratio;
  }

  const printRatioSession = async (message, type) => {
    const ratio = await getRatio()
    const output = `Ratio Session: ${ratio.session_ratio} (Uploaded: ${ratio.session_uploaded} | Downloaded: ${ratio.session_downloaded} )`;

    sendMessage(message, output, type);

  }

  const printRatioTotal = async (message, type) => {
    const ratio = await getRatio()
    const output = `Ratio Total: ${ratio.total_ratio} (Uploaded: ${ratio.total_uploaded} | Downloaded: ${ratio.total_downloaded} )`;

    sendMessage(message, output, type);

  }

  const printFullStats = async (message, type) => {
    const sysinfo_results = await socket.get("system/system_info");
    const uptime = sysinfo_results.client_started
    const clientv = sysinfo_results.client_version
    const os_info_result = Utils.getOsInfo()
    const os_info = os_info_result[0]
    const os_info_err = os_info_result[1]
    const ratio = await getRatio()
    const output = `
  -=[ ${clientv} http://www.airdcpp.net ]=-
  -=[ Uptime: ${Utils.formatUptime(Utils.clientUptime(uptime))} ]=-
  -=[ Ratio Session: ${ratio.session_ratio} (Uploaded: ${ratio.session_uploaded} | Downloaded: ${ratio.session_downloaded} ) ]=-
  -=[ Ratio Total: ${ratio.total_ratio} (Uploaded: ${ratio.total_uploaded} | Downloaded: ${ratio.total_downloaded} ) ]=-
  -=[ OS: ${os_info} (Uptime: ${Utils.formatUptime(os.uptime())}) ]=-
  -=[ CPU: ${os.cpus()[0].model} ]=-
    `;

    sendMessage(message, output, type);
    if (os_info_err) {
      postEvent(`Error when getting OS info: ${os_info_err}`, 'error');
    }

  }

  const printUptime = async (message, type) => {
    const results = await socket.get("system/system_info");
    const uptime = results.client_started
    const output = `
-=[ Uptime: ${Utils.formatUptime(Utils.clientUptime(uptime))} ]=-
-=[ System Uptime: ${Utils.formatUptime(os.uptime())} ]=-
    `;

    sendMessage(message, output, type);

  }

  // Basic chat command handling, returns possible status message to post
  const checkChatCommand = (message, type) => {
    const text = message.text
    if (text.length === 0 || text[0] !== '/') {
      return null;
    }

    if (text == '/help') {
      return `

    User commands

    /uptime\t\tShow uptime (Client & System)\t\t\t(public, visible to everyone)
    /stats\t\tShow various stats (Client, Uptime, Ratio, CPU)\t\t\t(public, visible to everyone)
    /ratio\t\tShow Upload/Download stats\t\t\t(public, visible to everyone)
    /sratio\t\tShow Session Upload/Download stats\t\t\t(public, visible to everyone)

      `;
    } else if (text == '/sratio') {
        printRatioSession(message, type);
        return null;
    } else if (text == '/ratio') {
        printRatioTotal(message, type);
        return null;
    } else if (text == '/stats') {
        printFullStats(message, type);
        return null;
    } else if (text == '/uptime') {
        printUptime(message, type);
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