import { getUser, searchNicks } from '../api_calls';
import { printStatusMessage } from '../log';

// /user command
export const printUser = async (username: string[], type: string, entityId: string|number) => {
  let output: string;
  const res = await searchNicks(username[0]);
  if (res[0]) {
    const user = await getUser(res[0].cid);
    output = `Found user: "${user.nicks}" on Hubs: "${user.hub_names}"`;
  } else {
    output = `Not match found for user: "${username}"`;
  }

  printStatusMessage(output, type, entityId);
};
