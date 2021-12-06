"use strict";

const { Response, BadRequestErr } = require("fusion-http-response");
const beatOfTheDayService = require("../../services/v1/beat-of-the-day-service");
const {dayOftheBeatValidator} = require("../../validators/beat-of-the-day-validator");
const { keyBy, map } = require("lodash");

async function getBeatOfTheDay(req, res){
    let response = new Response();
    try{
        const {body} = req;
        const errors = dayOftheBeatValidator(body);
        if (errors.length) throw new BadRequestErr(errors[0].message);
        response.payload = await beatOfTheDayService.getBeatOftheDay(body);
        // let resultArr = [];
        // map(response.payload, (obj) => {
        //     console.log(obj.f_beat_plan_master.split(",")[1]);
        // });
    } catch (err) {
    response = err;
    global.logger.error(err);
    } finally {
    res.status(response.status || 500).json(response);
    }
} 

module.exports = {
   getBeatOfTheDay
};