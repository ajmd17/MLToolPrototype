var express = require('express');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var multer = require('multer');
import * as multerS3 from 'multer-s3';
import * as httpStatus from 'http-status-codes';

var conversions = require('./conversions');
var evaluate = require('./evaluate');

import * as AWS from 'aws-sdk';
AWS.config.loadFromPath(path.join(__dirname, '../aws.config.json'));
const s3 = new AWS.S3();

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'mlmodeltestingbucket',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString())
    }
  })
});

import SKLearnModel from './converters/SKLearnModel';
import PMMLModel from './pmml/PMMLModel';
import ModelSchema from './ModelSchema';
import WeightedModel from './WeightedModel';

mongodb.MongoClient.connect('mongodb://localhost:27017/mlmodeltesting', function (err, db) {
  if (err) {
    throw err;
  }

  var app = express();
  app.use(bodyParser.json());

  app.set('view engine', 'ejs');

  app.set('views', path.join(__dirname, '../public/templates'));
  app.use('/js', express.static(path.join(__dirname, '../public/js')));
  app.use('/css', express.static(path.join(__dirname, '../public/css')));
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  app.get('/', (req, res) => {
    res.render('index');
  });

  app.get('/demo/:modelid', (req, res) => {
    db.collection('uploadedmodels').findOne({
      _id: mongodb.ObjectId(req.params.modelid)
    }).then(function (doc) {
      res.render('demo', {
        model: doc
      });
    }).catch(function (err) {
      console.error('Failed to load model with id ' + req.params.modelid, err);
      res.status(500).json({
        error: 'Could not load model'
      });
    });
  });

  app.get('/upload', (req, res) => { res.render('upload'); });

  var apiRouter = express.Router();

  apiRouter.get('/models/:modelid', function (req, res) {
    db.collection('uploadedmodels').findOne({
      _id: mongodb.ObjectId(req.params.modelid)
    }).then(function (doc) {
      res.json(doc);
    }).catch(function (err) {
      console.error('Failed to load model with id ' + req.params.modelid, err);
      res.status(500).json({
        error: 'Could not load model with id ' + req.params.modelid
      });
    });
  });
  
  apiRouter.get('/uploads', function (req, res) {
    db.collection('uploadedmodels').find().sort({ timestamp: -1 }).toArray(function (err, docs) {
      if (err) {
        console.error('Error finding uploads: ', err);
        return res.sendStatus(500);
      }

      res.json(docs);
    });
  });

  app.use('/api', apiRouter);

  function fixCsv(csv) {
    var csvLines = csv.split('\n');

    return csvLines.reduce(function (accum, line, i) {
      var lineSplit = line.split(',');
      var lineParts = lineSplit.filter(function (el, i) {
        if (el.length == 0 && i == lineSplit.length - 1) {
          return false;
        }
        return true;
      });

      if (lineParts.length == 0) {
        return accum;
      }

      return accum + lineParts.reduce(function (accum, part, i) {
        return accum + part + ((i != lineParts.length - 1) ? ',' : '');
      }, '') + '\n';
    }, '');
  }

  app.post('/evaluate/:modelid', function (req, res) {
    db.collection('uploadedmodels').findOne({
      _id: mongodb.ObjectId(req.params.modelid)
    }).then(function (doc) {
      const fixedCsv = fixCsv(req.body.csv);

      const model = new WeightedModel(
        new PMMLModel(doc.left.schema, doc.left.key), 
        (doc.right != null)
          ? new PMMLModel(doc.right.schema, doc.right.key)
          : null,
        doc.weight
      );

      model.evaluate(fixedCsv).then((result) => {
        res.json(result);
      }).catch((err) => {
        console.error('Evaluation failed', err);
        res.status(500).json({
          error: 'Evaluation failed due to error: `' + err.message + '`.'
        });
      });
    }).catch(function (err) {
      console.error('Failed to load model with id ' + req.params.modelid, err);
      res.status(500).json({
        error: 'Could not load model with id ' + req.params.modelid
      });
    });
  });

  var uploadRouter = express.Router();

  uploadRouter.post('/', upload.single('model_file'), (req, res) => {
    if (req.body.modeltype === undefined) {
      return res.status(400).json({
        error: 'modeltype not provided'
      });
    }

    if (req.file == null) {
      return res.status(400).json({
        error: 'no file provided'
      });
    }

    const { key } = req.file;

    var filepath = req.file.path;

    switch (req.body.modeltype) {
      case 'sklearn_pickle':
        new SKLearnModel(key).getModel().then((pmmlModel) => {
          return db.collection('uploadedmodels').insertOne({
            name: req.file.originalname,
            timestamp: new Date(),
            ...(new WeightedModel(pmmlModel, null, 1.0).serialize())
          }).then(function (doc) {
            res.json({ doc });
          }).catch(function (err) {
            console.error('Failed to store file record in db: ', err);
            res.status(500).json({
              error: 'Storage of uploaded model failed.'
            });
          });
        }).catch((err) => {
          console.error('Failed to convert sklearn model to pmml: ', err);
          res.status(500).json({
            error: err.message
          });
        });

        break;

      case 'pmml':
        PMMLModel.byKey(key).then((pmml) => {
          db.collection('uploadedmodels').insertOne({
            name: req.file.originalname,
            timestamp: new Date(),
            ...(new WeightedModel(pmml, null, 1.0).serialize())
          }).then(function (doc) {
            res.sendStatus(200);
          }).catch(function (err) {
            console.error('Storage of uploaded model failed:', err);
            res.status(500).json({
              error: 'Storage of uploaded model failed.'
            });
          });
        }).catch(function (err) {
          res.status(500).json({
            error: 'Failed to load model with key: "' + key + '".'
          });
        });

        break;

      default:
        return res.status(400).json({
          error: 'unknown modeltype value'
        });
    }
  });

  app.use('/upload', uploadRouter);

  app.listen(8080, function () {
    console.log('Listening on port 8080');
  });
});