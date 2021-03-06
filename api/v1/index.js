var express = require('express');
var router = express.Router();

/* 加载此版本所有api */

var user = require('./user/index.js');
var bbs = require('./bbs/index.js');
var reply = require('./bbs/reply.js');
var collect =require('./bbs/collect.js')
router.use('/user',user);
router.use('/bbs',bbs);
router.use('/reply',reply);
router.use('/collect',collect);//收藏

module.exports = router;