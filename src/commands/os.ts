import * as Utils from '../utils'
import { printEvent } from '../log'

// /os command
export const printOsInfo = async () => {
  const osInfoResult = Utils.getOsInfo();
  if (osInfoResult[1].length !== 0) {
    printEvent(`Error when getting OS info: ${osInfoResult[1]}`, 'error');
    return;
  } else {
    return `-=[ Operating system: ${osInfoResult[0]} ]=-`;
  }
};