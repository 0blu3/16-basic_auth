'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('cfgram:gallery-router');

const Gallery = require('../model/gallery.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const galleryRouter = module.exports = Router();

galleryRouter.post('/api/gallery', bearerAuth, jsonParser, function(req, res, next) {
    debug('POST: /api/gallery');

    req.body.userID = req.user._id;
    new Gallery(req.body).save()
    .then( gallery => res.json(gallery))
    .catch(next);
});

galleryRouter.get('/api/gallery/:id', bearerAuth, function(req, res, next) {
    debug('GET: /api/gallery/:id');

    Gallery.findById(req.params.id)
    .then( gallery => {
        if (gallery.userID.toString() !== req.user._id.toString()) {
            return next(createError(401, 'invalid user'));
        }
        res.json(gallery);
    })
    .catch(next);
});

galleryRouter.put('/api/gallery/:id', bearerAuth, jsonParser, function(req, res, next) {
    debug('PUT: /api/gallery/:id');

    if (!req.body.name) return next(createError(400, 'expected a gallery name'));
    if (!req.body.desc) return next(createError(400, 'expected a gallery description'));

    Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then( gallery => {
        if (gallery.userID.toString() !== req.user._id.toString()) {
            return next(createError(401, 'invalid user'));
        }
        res.json(gallery);
    })
    .catch(next);
});

galleryRouter.delete('/api/gallery/:id', bearerAuth, function(req, res, next) {

    Gallery.findByIdAndRemove(req.params.id)
    .then( () => res.status(204).send('gallery removed'))
    .catch(err => next(createError(404, err.message)));
});