class FetchLocations {
  constructor(fetchLocations) {
    this.fetchLocations = fetchLocations;
  }

  call() {
    this.fetchLocations.fetch( (results) => {
      var fs = require('fs');
      console.log( results );
      // fs.writeFile('gemeinden.json', JSON.stringify(results, null, 4), function (err) {
      //   if (err) return console.log(err);
      // });
    });
    this.fetchLocations.updateStore();
  };
}

module.exports = FetchLocations;
