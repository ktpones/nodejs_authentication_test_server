module.exports = () => {
  const router = require('express').Router();
  const { authMiddleware } = require('../middlewares');
  const {
    otpValidator,
    registerValidator,
    loginValidator,
    updateValidator,
    uniqueEmailValidator,
    refreshTokenvalidator,
  } = require('../validators/');

  const { AuthController } = require('../controllers');

  const {
    register,
    registerVerificationByOtp,
    login,
    profile,
    update,
    refreshToken,
  } = AuthController;

  /** **************************SUMANIX API*********************8 */

  /** Register */
  router.post(
    '/register',
    registerValidator,
    uniqueEmailValidator,
    register.bind(AuthController),
  );

  /** Register-Verification */
  router.post(
    '/verification',
    otpValidator,
    registerVerificationByOtp.bind(AuthController),
  );

  /** Register-Verification */
  router.post(
    '/refreshToken',
    refreshTokenvalidator,
    refreshToken.bind(AuthController),
  );

  /** Login */
  router.post('/login', loginValidator, login.bind(AuthController));

  /** Getting data for private profile */
  router
    .route('/user')
    .get(authMiddleware, profile.bind(AuthController))
    .put(authMiddleware, updateValidator, update.bind(AuthController));

  return router;
};
