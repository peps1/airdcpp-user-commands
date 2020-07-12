'use strict';

import os from 'os';
import * as Utils from './utils';
import fs from 'fs';
import type { APISocket } from 'airdcpp-apisocket';
const CONFIG_VERSION = 1;

// This will be populated with version from webpack
declare const EXTENSION_VERSION: string;


// Settings manager docs: https://github.com/airdcpp-web/airdcpp-extension-settings-js
import SettingsManager from 'airdcpp-extension-settings';


export default (socket: APISocket, extension: any) => {

  // Default settings
  const SettingDefinitions = [
    {
      key: 'output_directory',
      title: 'Output directory',
      default_value: extension.logPath + 'output',
      type: 'string'
    }
  ];

	// INITIALIZATION
	const settings = SettingsManager(socket, {
		extensionName: extension.name,
		configFile: extension.configPath + 'config.json',
		configVersion: CONFIG_VERSION,
		definitions: [
			...SettingDefinitions,
		],
	});


  // https://airdcpp.docs.apiary.io/#reference/private-chat-sessions/methods/send-status-message
  // https://airdcpp.docs.apiary.io/#reference/hub-sessions/messages/send-status-message
  const printStatusMessage = (statusMessage: string, type: string, entityId: string|number) => {
    try {
      socket.post(`${type}/${entityId}/status_message`, {
        text: statusMessage,
        severity: 'info',
      });
    } catch (e) {
      printEvent(`Failed to send: ${e}`, 'error');
    }

  };

  // https://airdcpp.docs.apiary.io/#reference/hub-sessions/messages/send-chat-message
  // https://airdcpp.docs.apiary.io/#reference/private-chat-sessions/methods/send-chat-message
  const sendChatMessage = (chatMessage: string, type: string, entityId: string|number) => {
    try {
      socket.post(`${type}/${entityId}/chat_message`, {
        text: chatMessage,
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
  const printEvent = (eventMessage: string, severity: string) => {
    socket.post('events', {
      text: `${eventMessage}`,
      severity,
    });
  };


  const getRatio = async () => {
    const results: any = await socket.get('transfers/tranferred_bytes');

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
  const printRatioSession = async (type: string, entityId: string|number) => {
    const ratio = await getRatio();
    const output = `Ratio Session: ${ratio.session_ratio} (Uploaded: ${ratio.session_uploaded} | Downloaded: ${ratio.session_downloaded} )`;

    sendChatMessage(output, type, entityId);

  };

  // /ratio command
  const printRatioTotal = async (type: string, entityId: string|number) => {
    const ratio = await getRatio();
    const output = `Ratio Total: ${ratio.total_ratio} (Uploaded: ${ratio.total_uploaded} | Downloaded: ${ratio.total_downloaded} )`;

    sendChatMessage(output, type, entityId);

  };

  // /stats command
  const printFullStats = async (type: string, entityId: string|number) => {
    const sysinfoResults: any = await socket.get('system/system_info');
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

  // /uptime command
  const printUptime = async (type: string, entityId: string|number) => {
    const results: any = await socket.get('system/system_info');
    const uptime = results.client_started;
    const output = `
-=[ Uptime: ${Utils.formatUptime(Utils.clientUptime(uptime))} ]=-
-=[ System Uptime: ${Utils.formatUptime(os.uptime())} ]=-
    `;

    sendChatMessage(output, type, entityId);

  };

  // /version command
  const printVersion = async (type: string, entityId: string|number) => {
    let version;
    if (process.env.npm_package_version) {
      version = process.env.npm_package_version;
    } else if (EXTENSION_VERSION) {
      version = EXTENSION_VERSION;
    } else {
      version = 'Couldn\'t define version'
    }

    // sendMessage(message, `Extension Version: ${output}`, type);
    printStatusMessage(`Extension Version: ${version}`, type, entityId);

  };

  const listShareContent = async (userResults: any, fileListResult: any) => {
    // The Download might take a moment, make sure we don't ask the content too early
    // TODO: Make sure this doesn't try forever, timeout after 30 seconds
    // TODO: check for failed states
    if (fileListResult.state.id !== 'loaded') {
      let fileListState = 'downloading'
      while (fileListState !== 'loaded') {
        await Utils.sleep(1000);
        // get the current filelist state
        const fileListSession: any = await getFileListSessionInfo(userResults);
        fileListState = fileListSession.state.id;
      }
    }

    const userFilelistItems: any = await getFileListItems(userResults);

    const currentDateTime = Utils.formatDateTime(new Date().toISOString());
    const outputFolderName = settings.getValue('output_directory');
    const username = Utils.cleanUsername(userResults[0].nick)
    const outputFilePath = `${outputFolderName}/share_list_${username}-${currentDateTime}.txt`;


    // make sure the Output folder exists
    if (!fs.existsSync(outputFolderName)) {
      fs.mkdir(outputFolderName, { recursive: true }, (err) => { return err });
    }

    // Write to file
    const f = fs.createWriteStream(outputFilePath);
    f.on('error', (error: any) => {
      printEvent(`Error writing to file - ${error}`, 'error');
    });
    userFilelistItems.items.forEach((item: any) => {
      f.write(item.name + '\n')
    })
    return { fileListResult, outputFilePath }
  }

  const getFileListItems = async (userResults: any) => {
    try {
      const userFilelistItems = await socket.get(`filelists/${userResults[0].cid}/items/0/9999`);
      return userFilelistItems;
    } catch (e) {
      printEvent(`File results: ${e.code} - ${e.message}`, 'error');
      return;
    }
  }

  const getFileListSessionInfo = async (userResults: any) => {
    try {
      const userFilelistSession = await socket.get(`filelists/${userResults[0].cid}`);
      return userFilelistSession;
    } catch (e) {
      printEvent(`File results: ${e.code} - ${e.message}`, 'error');
      return;
    }
  }

  // /list command
  const listShare = async (type: string, entityId: string|number, args: any) => {

    let fileListResult: any;
    let lsc: any;
    let outputFilePath: string;

    if (args.length >= 2) {
      const username = args[0];
      // The path can have spaces, everything following the Username will be considered as the path
      let listDir = args.slice(1).join(' ');
      if (listDir !== '/' || listDir.slice(-1) !== '/') {
        listDir = `${listDir}/`;
      }
      // search for the closest match with that username
      // TODO: check if username matches at all
      const userResults: any = await socket.post('users/search_nicks', {
        pattern: username,
        max_results: 1,
      });
      printStatusMessage(`Found user: "${userResults[0].nick}". Trying to list "${listDir}"`, type, entityId);


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
          fileListResult = await getFileListSessionInfo(userResults);

          // check what folder is used
          if (`${listDir}` !== fileListResult.location.path) {
            // A file list might be open already, but for another directory
            try {
              await socket.post(`filelists/${userResults[0].cid}/directory`, {
                list_path: `${listDir}`,
                reload: false,
              });
              fileListResult = await getFileListSessionInfo(userResults);

            } catch (error) {
              printEvent(`File results: ${error.code} - ${error.message}`, 'error');
              printStatusMessage(`File results: ${error.code} - ${error.message}`, type, entityId);
            }

          }
          lsc = await listShareContent(userResults, fileListResult);
          fileListResult = lsc.fileListResult;
          outputFilePath = lsc.outputFilePath;

          printEvent(`Listing completed, file written to: ${outputFilePath}`, 'info');
          printStatusMessage(`Listing completed, file written to: ${outputFilePath}`, type, entityId);
          return;
        }

      }

      try {
        lsc = await listShareContent(userResults, fileListResult);
        fileListResult = lsc.fileListResult;
        outputFilePath = lsc.outputFilePath;

        printEvent(`Listing completed, file written to: ${outputFilePath}`, 'info');
        printStatusMessage(`Listing completed, file written to: ${outputFilePath}`, type, entityId);
        return;
      } catch (error) {
        printEvent(`File results: ${error.code} - ${error.message}`, 'error');
        printStatusMessage(`File results: ${error.code} - ${error.message}`, type, entityId);
      }


    } else {
      printEvent('Missing parameter, needs username and directory path.', 'error');
      printStatusMessage('Missing parameter, needs username and directory path.', type, entityId);
    }

  };

  // Basic chat command handling, returns possible status message to post
  // TODO: (legacy, remove at some point)
  const checkLegacyChatCommand = (message: any, type: string) => {
    const text = message.text;
    if (text.length === 0 || text[0] !== '/') {
      return null;
    }

    const command = message.text.split(' ');
    const args = command.slice(1);

    if (text === '/help') {
      const helpText = `

        User commands

        /uptime\tShow uptime (Client & System)\t\t\t(public, visible to everyone)
        /stats\t\tShow various stats (Client, Uptime, Ratio, CPU)\t\t\t(public, visible to everyone)
        /ratio\t\tShow Upload/Download stats\t\t\t(public, visible to everyone)
        /sratio\tShow Session Upload/Download stats\t\t\t(public, visible to everyone)
        /version\tShow user-commands extension version\t\t\t(private, visible only to yourself)
        /list username /share/folder - List all items within a users shared folder, writing items to local file\t\t\t(private, visible only to yourself)

      `
      sendChatMessage(helpText, type, message.session_id)
    } else if (text === '/sratio') {
        printRatioSession(type, message.session_id);
        return null;
    } else if (text === '/ratio') {
        printRatioTotal(type, message.session_id);
        return null;
    } else if (text === '/stats') {
        printFullStats(type, message.session_id);
        return null;
    } else if (text === '/uptime') {
        printUptime(type, message.session_id);
        return null;
    } else if (text === '/version') {
        printVersion(type, message.session_id);
        return null;
    } else if (text.startsWith('/list ')) {
        listShare(type, message.session_id, args);
        return null;
    }

    return null;
  };

  // entityId is the session_id used to reference the current chat session
  // example https://airdcpp.docs.apiary.io/#reference/private-chat-sessions/methods/send-chat-message
  const checkChatCommand = (type: string, data: any, entityId: string|number) => {
    const { command, args } = data;

		switch (command) {
			case 'help': {
        return `

        User commands

        /uptime\tShow uptime (Client & System)\t\t\t(public, visible to everyone)
        /stats\t\tShow various stats (Client, Uptime, Ratio, CPU)\t\t\t(public, visible to everyone)
        /ratio\t\tShow Upload/Download stats\t\t\t(public, visible to everyone)
        /sratio\tShow Session Upload/Download stats\t\t\t(public, visible to everyone)
        /version\tShow user-commands extension version\t\t\t(private, visible only to yourself)
        /list username /share/folder - List all items within a users shared folder, writing items to local file\t\t\t(private, visible only to yourself)

        `;
			}
			case 'stats': {
        printFullStats(type, entityId);
			}
			case 'ratio': {
        printRatioTotal(type, entityId);
			}
			case 'sratio': {
        printRatioSession(type, entityId);
			}
			case 'uptime': {
        printUptime(type, entityId);
			}
			case 'version': {
        printVersion(type, entityId);
			}
			case 'list': {
        listShare(type, entityId, args);
			}
		}

		return null;
  };

  const onChatCommand = (type: string, data: any, entityId: string|number) => {
		const statusMessage = checkChatCommand(type, data, entityId);
		if (statusMessage) {
      printStatusMessage(statusMessage, type, entityId);
		}
  };

  const onOutgoingHubMessage = (message: any, accept: any) => {
    checkLegacyChatCommand(message, 'hubs');

    accept();

  };

  const onOutgoingPrivateMessage = (message: any, accept: any) => {
    checkLegacyChatCommand(message, 'private');

    accept();

  };


  extension.onStart = async (sessionInfo: any) => {

    await settings.load();

    const subscriberInfo = {
      id: 'user_commands',
      name: 'User commands',
    };

    if (sessionInfo.system_info.api_feature_level >= 4) {
      socket.addListener('hubs', 'hub_text_command', onChatCommand.bind(null, 'hubs'));
      socket.addListener('private_chat', 'private_chat_text_command', onChatCommand.bind(null, 'private_chat'));
    } else {
      socket.addHook('hubs', 'hub_outgoing_message_hook', onOutgoingHubMessage, subscriberInfo);
      socket.addHook('private_chat', 'private_chat_outgoing_message_hook', onOutgoingPrivateMessage, subscriberInfo);
    }
  };
};
