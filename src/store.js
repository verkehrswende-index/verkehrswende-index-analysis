class Store {
  constructor() {
    this.basePath = 'data/';
  };

  read(path) {
    var fs = require('fs');
    var data = fs.readFileSync(this.basePath + '/' + path, function (err) {
      if (err) return console.log(err);
    });
    return JSON.parse(data);
  };

  write(targetPath, data) {
    var fs = require('fs');
    var path = require('path');
    var fullPath = this.basePath + '/' + targetPath;
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 4), function (err) {
      if (err) return console.log(err);
    });
  };
}

module.exports = Store;
