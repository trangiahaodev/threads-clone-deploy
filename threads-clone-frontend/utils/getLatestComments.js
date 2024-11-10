const getLatestComments = (replies) => {
  const latestComments = {};
  const uniqueLatestComments = [];

  // Iterate over replies in reverse order
  for (let i = replies.length - 1; i >= 0; i--) {
    const reply = replies[i];
    const userId = reply.userId;

    // If the user has not been added to latestComments, add their latest comment
    if (!latestComments[userId]) {
      latestComments[userId] = reply;
      uniqueLatestComments.push(reply);
    }
  }

  // Since we iterated in reverse, reverse the result to get the original order
  return uniqueLatestComments.reverse();
};

export default getLatestComments;
