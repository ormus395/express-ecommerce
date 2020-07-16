exports.auth = (req, res, next) => {
  console.log(req.headers.cookie);
  next();
};
