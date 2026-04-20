export const getProfileImage = (user) => {
  return (
    user?.profileImage ||
    user?.profilePicture ||
    user?.avatar ||
    user?.image ||
    ""
  );
};

export const getUserInitials = (user) => {
  const name = user?.fullName || user?.userName || user?.email || "User";
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "U";
  }

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return words[0].slice(0, 2).toUpperCase();
};
