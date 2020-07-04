'use strict';

import os from 'os';
import * as Utils from './utils';

// MODULE

export default (socket: any, extension: any) => {

  const onOutgoingHubMessage = (message: any, accept: any) => {
    const statusMessage = checkChatCommand(message, 'hub');
    if (statusMessage) {
      printStatusMessage(message, statusMessage, 'hub');
    }

    accept();

  };

  const onOutgoingPrivateMessage = (message: any, accept: any) => {
    const statusMessage = checkChatCommand(message, 'private');
    if (statusMessage) {
      printStatusMessage(message, statusMessage, 'private');
    }

    accept();

  };

  // Send a status message that is only shown locally in this chat session.
  // https://airdcpp.docs.apiary.io/#reference/private-chat-sessions/methods/send-status-message
  // https://airdcpp.docs.apiary.io/#reference/hub-sessions/messages/send-status-message
  const printStatusMessage = (message: any, statusMessage: string, type: string) => {
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

  // Events are used for displaying and logging informative messages and errors to the application user.
  // Note that events are not bind to any specific context; some entities, such as hubs, provide similar
  // methods for showing information locally to the application user.
  // Messages will appear as popups and in the Events Log
  // https://airdcpp.docs.apiary.io/#reference/events
  const printEvent = (eventMessage: string, severity: string) => {
    socket.post('events', {
      text: `${eventMessage}`,
      severity,
    });
  };

  const sendMessage = async (message: any, output: string, type: string) => {

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

  // /sratio command
  const printRatioSession = async (message: any, type: string) => {
    const ratio = await getRatio();
    const output = `Ratio Session: ${ratio.session_ratio} (Uploaded: ${ratio.session_uploaded} | Downloaded: ${ratio.session_downloaded} )`;

    sendMessage(message, output, type);

  };

  // /ratio command
  const printRatioTotal = async (message: any, type: string) => {
    const ratio = await getRatio();
    const output = `Ratio Total: ${ratio.total_ratio} (Uploaded: ${ratio.total_uploaded} | Downloaded: ${ratio.total_downloaded} )`;

    sendMessage(message, output, type);

  };

  // /stats command
  const printFullStats = async (message: any, type: string) => {
    const sysinfoResults = await socket.get('system/system_info');
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

    sendMessage(message, output, type);
    if (osInfoErr.length !== 0) {
      printEvent(`Error when getting OS info: ${osInfoErr}`, 'error');
    }

  };

  // /uptime command
  const printUptime = async (message: any, type: string) => {
    const results = await socket.get('system/system_info');
    const uptime = results.client_started;
    const output = `
-=[ Uptime: ${Utils.formatUptime(Utils.clientUptime(uptime))} ]=-
-=[ System Uptime: ${Utils.formatUptime(os.uptime())} ]=-
    `;

    sendMessage(message, output, type);

  };

  // /version command
  const printVersion = async (message: any, type: string) => {
    const output = process.env.npm_package_version;

    // sendMessage(message, `Extension Version: ${output}`, type);
    printStatusMessage(message, `Extension Version: ${output}`, type);

  };

  const onFileListCreated = async (listener: any) => {
    console.log(`File list created: ${listener}`);
  };
  const onFileListDirectoryDownloadAdded = async (listener: any) => {
    console.log(`File list Download Added: ${listener}`);
  };
  const onFileListDirectoryDownloadRemoved = async (listener: any) => {
    console.log(`File list Download Removed: ${listener}`);
  };
  const onFileListDirectoryDownloadProcessed= async (listener: any) => {
    console.log(`File list Download Processed: ${listener}`);
  };
  const onFileListDirectoryDownloadFailed = async (listener: any) => {
    console.log(`File list Download Failed: ${listener}`);
  };

  const listShareContent = async (userResults: any, fileListResult: any) => {
    // The Download might take a moment, make sure we don't ask the content too early
    console.log(fileListResult);
    if (fileListResult.state.id !== 'loaded') {
      let fileListState = 'downloading'
      while (fileListState !== 'loaded') {
        console.log('Waiting 1 second while filelist is downloading...' + Date.now());
        await Utils.sleep(1000);
        // get the current filelist state
        const fileListSession: any = await getFileListSessionInfo(userResults);
        fileListState = fileListSession.state.id;
      }
      console.log('Listing Share content now...');
      const userFilelistItems = await getFileListItems(userResults);
      userFilelistItems.items.forEach((item: any) => {
        console.log(item.name);
      });
    } else {
      console.log('Listing Share content now, download was done already...');
      const userFilelistItems = await getFileListItems(userResults);
      userFilelistItems.items.forEach((item: any) => {
        console.log(item.name);
      });
    }
  }

  const getFileListItems = async (userResults: any) => {
    const userFilelistItems = await socket.get(`filelists/${userResults[0].cid}/items/0/9999`);
    return userFilelistItems;
  }

  const getFileListSessionInfo = async (userResults: any) => {
    const userFilelistSession = await socket.get(`filelists/${userResults[0].cid}`);
    return userFilelistSession;
  }

  // /list command
  const listShare = async (message: any, type: string) => {

    socket.addListener('filelists', 'filelist_created', onFileListCreated);
    socket.addListener('filelists', 'filelist_directory_download_added', onFileListDirectoryDownloadAdded);
    socket.addListener('filelists', 'filelist_directory_download_removed', onFileListDirectoryDownloadRemoved);
    socket.addListener('filelists', 'filelist_directory_download_processed', onFileListDirectoryDownloadProcessed);
    socket.addListener('filelists', 'filelist_directory_download_failed', onFileListDirectoryDownloadFailed);

    // split the command, first should be the username and then the directory to list
    // TODO: remove debug
    printStatusMessage(message, message.text, type);
    const command = message.text.split(' ');
    if (command.length >= 3) {
      const username = command[1];
      // The path can have spaces, everything following the Username will be considered as the path
      let listDir = command.slice(2).join(' ');
      // TODO: remove debug
      printStatusMessage(message, listDir.slice(-1), type);
      if (listDir !== '/' || listDir.slice(-1) !== '/') {
        listDir = `${listDir}/`;
      }
      // search for the closest match with that username
      // TODO: check if username matches at all
      const userResults = await socket.post('users/search_nicks', {
        pattern: username,
        max_results: 1,
      });
      // TODO: remove debug
      printStatusMessage(message, `For user: "${userResults[0].nick}" Listing ${listDir}`, type);

      let fileListResult;
      try {
        // Try to open the file list of that User
        fileListResult = await socket.post('filelists', {
          user: {
            cid: userResults[0].cid,
            hub_url: userResults[0].hub_url,
          },
          directory: listDir,
        });
      }

      catch (fileListsError) {
        // The file list might be open already
        if (fileListsError.code === 409) {
          // Get the already opened file list
          const userFileList = await getFileListSessionInfo(userResults);

          // check what folder is used
          if (`${listDir}` !== userFileList.location.path) {
            // A file list might be open already, but for another directory
            try {
              console.log('File list not in correct folder, switching folder.');
              await socket.post(`filelists/${userResults[0].cid}/directory`, {
                list_path: `${listDir}`,
                reload: false,
              });

            } catch (error) {
              printEvent(`File results: ${error.code} - ${error.message}`, 'error');
              printStatusMessage(message, `File results: ${error.code} - ${error.message}`, type);
            }

          }
        }

      }

      try {
        await listShareContent(userResults, fileListResult);
      } catch (error) {
        printEvent(`File results: ${error.code} - ${error.message}`, 'error');
        printStatusMessage(message, `File results: ${error.code} - ${error.message}`, type);
      }


    } else {
      printEvent('Missing parameter, needs username and directory path.', 'error');
    }

  };

  // Basic chat command handling, returns possible status message to post
  const checkChatCommand = (message: any, type: string) => {
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
    /list username /share/path\t\tShow Session Upload/Download stats\t\t\t(public, visible to everyone)
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
        listShare(message, type);
        return null;
    }

    return null;
  };

  extension.onStart = async () => {

    const subscriberInfo = {
      id: 'user_commands',
      name: 'User commands',
    };

    socket.addHook('hubs', 'hub_outgoing_message_hook', onOutgoingHubMessage, subscriberInfo);
    socket.addHook('private_chat', 'private_chat_outgoing_message_hook', onOutgoingPrivateMessage, subscriberInfo);
  };
};
