export default class WriteAreaConfigs {
  constructor( areas ) {
    this.areas = areas;
  }

  call() {
    console.log('starting');
    var areas = this.areas.getAll();
    for (const area of areas) {
      console.log('.');
      this.areas.writeAreaConfig(area);
    }
    console.log('done');
  };
}
