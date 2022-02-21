const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'here',

  // Optional depending on the providers
  httpAdapter: 'https',
  apiKey: 'ghYSMtVFpi5iR2KGanzfGcNqA8EdzSUZC-pUeawMSsM', // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};

function latlng (req, res, callback) {
  const geocoder = NodeGeocoder(options);
  const add = req.body.address + ' ' + req.body.city;
  geocoder.geocode({
    address: add,
    country: req.body.country,
    language: 'FR'
  }).then(result => {
    callback(result[0]);
  })
  .catch(err => {
    res.status(500).send({ message: "error " + err });
  });
};

function reverse (req, res, callback) {
  const geocoder = NodeGeocoder(options);
  geocoder.reverse(req.query)
    .then(result => {
      callback(result);
    })
    .catch(err => {
      res.status(500).send({ message: "error " + err });
    });
};

module.exports = {options, latlng, reverse};

