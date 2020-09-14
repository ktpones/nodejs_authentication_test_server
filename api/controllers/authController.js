const jwt = require('jsonwebtoken');

const tokenSecret = process.env.JWT_SECRET;

/** Importing services */
const { CommonService, JwtService } = require('../services');

/** Importing Models */
const { UserModel, UserModelMethods } = require('../models');

/** Importing Constants */
const MESSAGES = require('../config/message');

class AuthController extends CommonService {
  constructor() {
    super();
    this.JwtService = JwtService;
    this.UserModel = UserModel;
    this.UserModelMethods = UserModelMethods;
    this.MESSAGES = MESSAGES;
    this.CommonService = CommonService;
  }

  /*
   * @param null
   * @return Json.
   */
  login(req, res, next) {
    const reqData = req.body;
    // const role = 'CUSTOMER';
    const { email, password } = reqData;
    const refreshToken = this.CommonService.generateHash(email);

    return this.UserModel.findOneAndUpdate(
      {
        isDeleted: false,
        status: true,
        email,
      },
      {
        refreshToken,
        lastLogin: Date.now(),
      },
    )
      .then((user) => {
        if (!user) {
          return next(this.MESSAGES.CODE.INVALID_CREDENTIALS);
        }
        const that = this;
        return this.UserModelMethods.comparePassword(
          password,
          user,
          (err, valid) => {
            if (err) {
              return next(err);
            }
            if (!valid) {
              return next(this.MESSAGES.CODE.INVALID_CREDENTIALS);
            }
            const {
              firstname,
              lastname,
              bio,
              country,
              _id: id,
            } = user;
            return res.json({
              message: this.MESSAGES.AUTH.LOGIN,
              refreshToken,
              token: that.JwtService.issueToken(
                id /* eslint no-underscore-dangle: 0 */,
              ),
              data: {
                id,
                firstname: firstname || '',
                lastname: lastname || '',
                bio: bio || '',
                country: country || '',
                email,
              },
            });
          },
        );
      })
      .catch(err => next(err));
  }

  async refreshToken(req, res, next) {
    const payload = jwt.verify(req.body.accessToken, tokenSecret, { ignoreExpiration: true });
    const refreshToken = this.CommonService.generateHash(payload.auth);

    const user = await this.UserModel.findOneAndUpdate({
      _id: payload.auth,
      refreshToken: req.body.refreshToken,
    }, {
      refreshToken,
    }).lean();
    if (user) {
      return res.json({
        message: 'Token has been generated',
        refreshToken,
        token: this.JwtService.issueToken(
          user._id, /* eslint no-underscore-dangle: 0 */
        ),
      });
    }
    return next(new Error('NO_USER_FOUND'));
  }

  /*
   * @param null
   * @return Json.
   */
  register(req, res, next) {
    const postBody = {};
    const { email, password } = req.body;
    let { username } = req.body;
    if (!username || username === undefined || username === 'undefined') {
      username = this.CommonService.generateUsernameFromEmail(email);
    }
    const hash = this.CommonService.generateHash(email);
    postBody.hashToken = hash;
    postBody.username = username;
    postBody.email = email;
    postBody.password = password;
    postBody.otp = this.CommonService.generateOtp();
    return this.UserModel(postBody)
      .save()
      .then(() => new this.CommonService().reisterEmail(postBody, 'EMAIL VERIFICATION'))
      .then((isSent) => {
        if (isSent) {
          return res.status(201).json({
            hashToken: hash,
            message: this.MESSAGES.AUTH.REGISTER_OTP,
          });
        }
        return next('ACCOUNT_FAIL_WITH_NO_EMAIL');
      })
      .catch(err => next(err));
  }

  /**
   *
   * @param {object} req
   * @param {object} res
   * @param {object} next
   */
  registerVerificationByOtp(req, res, next) {
    return this.UserModel.findOneAndUpdate({
      otp: req.body.otp,
      hashToken: req.body.hashToken,
    },
    {
      status: true,
      otp: '',
    },
    {
      upsert: false,
      new: true,
    })
      .then((response) => {
        if (!response) {
          return next(new Error('INVALID_OTP'));
        }
        return res.json({
          message: 'Email succsessfully verified',
          ok: true,
        });
      })
      .catch(err => next(err));
  }

  /*
   * @param uId: User Id
   * @return Json.
   */
  profile(req, res, next) {
    return this.UserModel.findOne(
      {
        _id: req.user._id,
        status: true,
        isDeleted: false,
      },
      {
        _id: 1,
        username: 1,
        firstname: 1,
        lastname: 1,
        email: 1,
        createdAt: 1,
        country: 1,
        bio: 1,
      },
    )
      .then(response => res.json({
        data: {
          id: response._id,
          firstname: response.firstname || '',
          lastname: response.lastname || '',
          bio: response.bio || '',
          country: response.country || '',
          email: response.email,
        },
      }))
      .catch((err) => {
        next(err);
      });
  }

  /*
   * @param uId: User Id
   * @return Json.
   */
  update(req, res, next) {
    const uId = req.user._id;
    const updatedObj = {};
    if (req.body.firstname) {
      updatedObj.firstname = req.body.firstname;
    }
    if (req.body.username) {
      updatedObj.username = req.body.username;
    }
    if (req.body.lastname) {
      updatedObj.lastname = req.body.lastname;
    }
    if (req.body.country) {
      updatedObj.country = req.body.country;
    }
    if (req.body.bio) {
      updatedObj.bio = req.body.bio;
    }
    this.UserModel.findOneAndUpdate(
      { _id: uId },
      {
        $set: req.body,
      },
      {
        new: true,
      },
    )
      .then(response => res.json({
        data: {
          id: response._id,
          firstname: response.firstname || '',
          lastname: response.lastname || '',
          bio: response.bio || '',
          country: response.country || '',
          email: response.email,
        },
        message: this.MESSAGES.AUTH.PROFILE_UPDATE,
      }))
      .catch((err) => {
        next(err);
      });
  }
}

module.exports = new AuthController();
