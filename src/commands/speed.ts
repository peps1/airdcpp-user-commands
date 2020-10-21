import * as Utils from '../utils';
import {printEvent} from '../log';

let transferStats: any = [];

const onTransferStats = (data: (string|number)[]) => {
  transferStats.push(data);
};

export const printNetworkSpeedInfo = async () => {
  const removeTransferStatsListener = await globalThis.SOCKET.addListener('transfers', 'transfer_statistics', onTransferStats);

  // Wait for the events to come in and pobulate transferStats
  let timeWaiting = 0;
  while (!transferStats[0] || timeWaiting >= 5000) {
    await Utils.sleep(100);
    timeWaiting = timeWaiting + 100;
  }

  removeTransferStatsListener();
  if (transferStats[0]) {
    printEvent(`Waited: ${timeWaiting} ms`, 'info');
    let speedUp = transferStats[0].speed_up;
    let speedDown = transferStats[0].speed_down;

    if (!speedDown) {speedDown = 0;};
    if (!speedUp) {speedUp = 0;};
    const output = `-=[ Network Speed ][ Downloading: ${Utils.formatNetSpeed(speedDown)}/s ][ Uploading: ${Utils.formatNetSpeed(speedUp)}/s ]=-`;

    // Reset variables for next command
    timeWaiting = 0;
    transferStats = [];

    return output;

  } else {
    printEvent(`Error when getting Speed statistics, waited ${timeWaiting/1000} seconds`, 'error');
    // Reset variables for next command
    timeWaiting = 0;
    transferStats = [];
    return;
  }
};
