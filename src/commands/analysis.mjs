import PQueue from 'p-queue';
import delay from 'delay';
import process from 'process';

export default class Analysis {
  constructor( list, store, areas ) {
    this.list = list;
    this.store = store;
    this.areas = areas;
  }

  async call() {
    const queue = new PQueue({concurrency: 2});
    var analysis = 'bike_infrastructure';
    var areas = this.areas.getAll();
    for (const area of areas) {
      queue.add(async () => {
        console.log("Analysing", area.name);
        var data = await this.list[analysis].start(area);
        console.log("Done Analysing", area.name);
        const basePath = `areas/${area.getSlug()}/analysis/${analysis}`;
        this.store.write(basePath + '/features.json', data.features);
        this.store.write(basePath + '/results.json', data.results);
        console.log("Done Writing", area.name);
      });
    }
    while (queue.size) {
      process.stdout.write("\r\x1b[K");
      process.stdout.write(queue.size + " jobs running");
      await delay(5000);
    }
  };
}
