import * as Utils from '../utils';
import { printEvent } from '../log';

// /os command
export const printOsInfo = async () => {
  const osInfoResult = Utils.getOsInfo();
  return `-=[ Operating system: ${osInfoResult[0]} ]=-`;
};
