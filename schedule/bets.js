var express = require("express");
let { respok, resperr } = require("../utils/rest");
const { getobjtype } = require("../utils/common");
const jwt = require('jsonwebtoken');
const { auth } = require('../utils/authMiddleware');
const db = require('../models')
var moment = require('moment');
const LOGGER = console.log;
const cron = require("node-cron");

cron.schedule('*/1 * * * *', async()=>{
    console.log(
        '@Round Check',
        moment().format('HH:mm:ss'),
        '@binopt'
    );
    const timenow = moment().startOf('minute');
    console.log(timenow.unix())

})