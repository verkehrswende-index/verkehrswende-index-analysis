class Analysis {
  constructor( list, overpass ) {
    this.list = list;
  }

  call() {
    this.list['bike_infrastructure'].run(
      (results) => {
        fs = require('fs');
        fs.writeFile('data/areas/Frankfurt_am_Main/analysis/radinfrastruktur/features.json', JSON.stringify(results, null, 4), function (err) {
          if (err) return console.log(err);
          console.log('Hello World > helloworld.txt');
        });
      });
  };
}

module.exports = Analysis;
