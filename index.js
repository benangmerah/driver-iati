var util = require('util');

var iati2lod = require('iati2lod');
var request = require('request');

var BmDriverBase = require('benangmerah-driver-base');

function IatiDriver() {}
util.inherits(IatiDriver, BmDriverBase);

module.exports = IatiDriver;

IatiDriver.prototype.setOptions = function(options) {
  if (!options) {
    options = {};
  }

  this.options = options;
};

IatiDriver.prototype.fetch = function() {
  var self = this;

  var graph = new PassthroughGraph(self);

  self.info('Fetching IATI file from source...');

  request(self.options.iatiUrl, function(err, res, body) {
    if (err) {
      return self.error(err);
    }

    self.info('Parsing and adding triples...');
    iati2lod.convertIatiString(body, graph);
    self.finish();
  });
};

function PassthroughGraph(driverInstance) {
  this.driverInstance = driverInstance;
}
PassthroughGraph.prototype.add = function(triple) {
  var subject = triple.subject.nominalValue;
  var predicate = triple.predicate.nominalValue;

  var object;
  var objectNT = triple.object.toNT();
  if (objectNT[0] === '"') {
    object = objectNT;
  }
  else {
    object = triple.object.valueOf();
  }

  this.driverInstance.addTriple(subject, predicate, object);
};

BmDriverBase.handleCLI();