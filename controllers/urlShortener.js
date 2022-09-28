const express = require('express');
const validUrl = require('valid-url');
const shortid = require('shortid');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const Url = require('../models/urlModel');

const baseUrl = 'http://localhost:4000';

const shortenUrl = catchAsync(async (req, res, next) => {
    const { longUrl } = req.body
    // check base url if valid using the validUrl.isUri method
    if (!validUrl.isUri(baseUrl)) {
        return res.status(401).json('Invalid base URL')
    }
    // If valid, we create the url code
    const urlCode = shortid.generate()

    // check long url if valid using the validUrl.isUri method
    if (validUrl.isUri(longUrl)) {
        try {
            let url = await Url.findOne({ longUrl })

            // if url exists, return the response
            if (url) {
                res.json(url)

            }
            else {
                // join the generated urlCode with the base url
                const shortUrl = baseUrl + '/' + urlCode
                // invoke the url model and save it to the database
                url = new Url({
                    longUrl,
                    shortUrl,
                    urlCode,
                    createdBy : req.user.id,
                    date: new Date()
                })
                await url.save();
                res.json(url);

            }
        }
        catch (err) {
            console.log(err)
            res.status(500).json('Server error');

        }

    }
    else {
        res.status(400).json('Invalid longUrl');
    }
});

// redirect to the longUrl
const redirectUrl = catchAsync(async (req, res, next) => {
    try {
        // find a document match to the code in the req.params.code
        const url = await Url.findOne({
            urlCode: req.params.code
        })
        if (url) {
            // if valid, we perform a redirect to the long Url
            return res.redirect(url.longUrl);
        } else {
            // return a not found 404 status
            return res.status(404).json('Not Found!');
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json('Server Error!');
    }

});

module.exports = {
    shortenUrl,
    redirectUrl
    
}




