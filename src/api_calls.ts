export const searchNicks = async (username: string) => {
  // search for the closest match with that username
  // TODO: check if username matches at all
  let userResults: any;

  try {
    userResults = await globalThis.SOCKET.post('users/search_nicks', {
      pattern: username,
      max_results: 1,
    });
  } catch (e) {
    userResults = e;
  }
  return userResults;
};

export const getUser = async (userCid: string) => {
  let userResults: any;

  try {
    userResults = await globalThis.SOCKET.get(`users/${userCid}`);
  } catch (e) {
    userResults = e;
  }
  return userResults;
};
