import * as Utils from '../utils';

// /os command
export const printOsInfo = async () => {
  const osInfoResult = Utils.getOsInfo();
  return `-=[ OS: ${osInfoResult[0]} ]=-`;
};
