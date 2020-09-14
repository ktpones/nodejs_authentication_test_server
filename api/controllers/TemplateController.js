/*
* Author : Sunny Chauhan
* Module : AuthsController
* Description : Use to login the user with social media
*/
const AppMessages = require('../config/message.js');
// const AppConstants = require(`../config/Constant.js`);
const { TemplateModel } = require('../models');

class TemplateController {
  static adminAdd(req, res) {
    TemplateModel(req.body).save((err, resData) => {
      if (err) return res.json({ resStatus: 'error', msg: AppMessages.SERVER_ERR });
      return res.json({ resStatus: 'success', msg: AppMessages.LOGIN, result: resData });
    });
  }

  static adminUpdate(req, res) {
    TemplateModel.findOneAndUpdate({ _id: req.body._id }, req.body, { upsert: false, new: true }, (err, resData) => {
      if (err) return res.json({ resStatus: 'error', msg: AppMessages.SERVER_ERR });
      return res.json({ resStatus: 'success', msg: 'Update Successfll', result: resData });
    });
  }

  static adminView(req, res) {
    TemplateModel.findOne({ _id: req.query.reqId }, (err, resData) => {
      if (err) return res.json({ resStatus: 'error', msg: AppMessages.SERVER_ERR });
      return res.json({ resStatus: 'success', msg: 'Template View', result: resData });
    });
  }

  static adminList(req, res) {
    TemplateModel.find({ isDeleted: false }, (err, resData) => {
      if (err) return res.json({ resStatus: 'error', msg: AppMessages.SERVER_ERR });
      if (resData) {
        return res.json({ resStatus: 'success', msg: 'Template List', result: resData });
      }
      return res.json({ resStatus: 'error', msg: AppMessages.SERVER_ERR });
    });
  }

  static adminRemove(req, res) {
    TemplateModel.findOneAndUpdate({ _id: req.query.reqId }, { isDeleted: true }, { new: true }, (err, resData) => {
      if (err) return res.json({ resStatus: 'error', msg: AppMessages.SERVER_ERR });
      if (resData) {
        return res.json({ resStatus: 'success', msg: 'Template has been removed Successfully' });
      }
      return res.json({ resStatus: 'error', msg: AppMessages.SERVER_ERR });
    });
  }
}

module.exports = new TemplateController();
