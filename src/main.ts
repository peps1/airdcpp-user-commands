'use strict';

import os from 'os';
import * as Utils from './utils';
import fs from 'fs';

const CONFIG_VERSION = 1;
declare const EXTENSION_VERSION: string;


// Settings manager docs: https://github.com/airdcpp-web/airdcpp-extension-settings-js
import SettingsManager from 'airdcpp-extension-settings';


export default (socket: any, extension: any) => {

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

  const onOutgoingHubMessage = (message: any, accept: any) => {
    const statusMessage = checkLegacyChatCommand(message, 'hub');
    if (statusMessage) {
      printStatusMessage(message, statusMessage, 'hub');
    }

    accept();

  };

  const onOutgoingPrivateMessage = (message: any, accept: any) => {
    const statusMessage = checkLegacyChatCommand(message, 'private');
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
    let version;
    if (process.env.npm_package_version) {
      version = process.env.npm_package_version;
    } else if (EXTENSION_VERSION) {
      version = EXTENSION_VERSION;
    } else {
      version = 'Couldn\'t define version'
    }

    // sendMessage(message, `Extension Version: ${output}`, type);
    printStatusMessage(message, `Extension Version: ${version}`, type);

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

    const userFilelistItems = await getFileListItems(userResults);

    const currentDateTime = Utils.formatDateTime(new Date().toISOString());
    const outputFolderName = settings.getValue('output_directory');
    const outputFilePath = `${outputFolderName}/share_list_${userResults[0].nick}-${currentDateTime}.txt`;


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
  const listShare = async (message: any, type: string, args: any) => {

    let fileListResult;
    let lsc;
    let outputFilePath;

    // split the command, first should be the username and then the directory to list
    printStatusMessage(message, message.text, type);
    printStatusMessage(message, args.toString(), type);
    const command = message.text.split(' ');

    if (command.length >= 3) {
      const username = command[1];
      // The path can have spaces, everything following the Username will be considered as the path
      let listDir = command.slice(2).join(' ');
      if (listDir !== '/' || listDir.slice(-1) !== '/') {
        listDir = `${listDir}/`;
      }
      // search for the closest match with that username
      // TODO: check if username matches at all
      const userResults = await socket.post('users/search_nicks', {
        pattern: username,
        max_results: 1,
      });
      printStatusMessage(message, `Found user: "${userResults[0].nick}". Trying to list "${listDir}"`, type);


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
              printStatusMessage(message, `File results: ${error.code} - ${error.message}`, type);
            }

          }
          lsc = await listShareContent(userResults, fileListResult);
          fileListResult = lsc.fileListResult;
          outputFilePath = lsc.outputFilePath;

          printEvent(`Listing completed, file written to: ${outputFilePath}`, 'info');
          printStatusMessage(message, `Listing completed, file written to: ${outputFilePath}`, type);
          return;
        }

      }

      try {
        lsc = await listShareContent(userResults, fileListResult);
        fileListResult = lsc.fileListResult;
        outputFilePath = lsc.outputFilePath;

        printEvent(`Listing completed, file written to: ${outputFilePath}`, 'info');
        printStatusMessage(message, `Listing completed, file written to: ${outputFilePath}`, type);
        return;
      } catch (error) {
        printEvent(`File results: ${error.code} - ${error.message}`, 'error');
        printStatusMessage(message, `File results: ${error.code} - ${error.message}`, type);
      }


    } else {
      printEvent('Missing parameter, needs username and directory path.', 'error');
      printStatusMessage(message, 'Missing parameter, needs username and directory path.', type);
    }

  };

  // Basic chat command handling, returns possible status message to post
  // TODO: (legacy, remove at some point)
  const checkLegacyChatCommand = (message: any, type: string) => {
    const text = message.text;
    if (text.length === 0 || text[0] !== '/') {
      return null;
    }

    if (text === '/help') {
      return `

        User commands

        /uptime\tShow uptime (Client & System)\t\t\t(public, visible to everyone)
        /stats\t\tShow various stats (Client, Uptime, Ratio, CPU)\t\t\t(public, visible to everyone)
        /ratio\t\tShow Upload/Download stats\t\t\t(public, visible to everyone)
        /sratio\tShow Session Upload/Download stats\t\t\t(public, visible to everyone)
        /version\tShow user-commands extension version\t\t\t(private, visible only to yourself)
        /list username /share/folder - List all items within a users shared folder, writing items to local file\t\t\t(private, visible only to yourself)

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
        listShare(message, type, null);
        return null;
    }

    return null;
  };

  const checkChatCommand = (message: any, type: string, data: any) => {
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
        printFullStats(message, type);
			}
			case 'ratio': {
        printRatioTotal(message, type);
			}
			case 'sratio': {
        printRatioSession(message, type);
			}
			case 'uptime': {
        printUptime(message, type);
			}
			case 'version': {
        printVersion(message, type);
			}
			case 'list': {
        listShare(message, type, args);
			}
		}

		return null;
  };

  const onChatCommand = (type: string, message: any, data: any, entityId: number) => {
		const statusMessage = checkChatCommand(message, type, data);
		if (statusMessage) {
			socket.post(`${type}/${entityId}/status_message`, {
				text: statusMessage,
				severity: 'info',
			});
		}
	};

  extension.onStart = async (sessionInfo: any) => {

    await settings.load();

    const subscriberInfo = {
      id: 'user_commands',
      name: 'User commands',
    };

    if (sessionInfo.system_info.api_feature_level >= 4) {
			socket.addListener('hubs', 'hub_text_command', onChatCommand.bind(this, 'hubs'));
      socket.addListener('private_chat', 'private_chat_text_command', onChatCommand.bind(this, 'private_chat'));
    } else {
      socket.addHook('hubs', 'hub_outgoing_message_hook', onOutgoingHubMessage, subscriberInfo);
      socket.addHook('private_chat', 'private_chat_outgoing_message_hook', onOutgoingPrivateMessage, subscriberInfo);
    }
  };
};
