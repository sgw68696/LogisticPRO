const getProfile = async (user) => {
  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
};

module.exports = {
  getProfile
};
