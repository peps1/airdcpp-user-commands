import fs from 'fs'

import * as Utils from '../utils'
import { printEvent, printStatusMessage } from '../log'
import { APISocket } from 'airdcpp-apisocket'

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
  const outputFolderName = SETTINGS.getValue('output_directory');
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
    const userFilelistItems = await SOCKET.get(`filelists/${userResults[0].cid}/items/0/9999`);
    return userFilelistItems;
  } catch (e) {
    printEvent(`File results: ${e.code} - ${e.message}`, 'error');
    return;
  }
}

const getFileListSessionInfo = async (userResults: any) => {
  try {
    const userFilelistSession = await SOCKET.get(`filelists/${userResults[0].cid}`);
    return userFilelistSession;
  } catch (e) {
    printEvent(`File results: ${e.code} - ${e.message}`, 'error');
    return;
  }
}

// /list command
export const listShare = async (type: string, entityId: string|number, args: any) => {

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
    const userResults: any = await SOCKET.post('users/search_nicks', {
      pattern: username,
      max_results: 1,
    });
    printStatusMessage(`Found user: "${userResults[0].nick}". Trying to list "${listDir}"`, type, entityId);


    try {
      // Try to open the file list of that User
      fileListResult = await SOCKET.post('filelists', {
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
            await SOCKET.post(`filelists/${userResults[0].cid}/directory`, {
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