import PQueue from 'p-queue';
import delay from 'delay';
import process from 'process';

export default class Analysis {
  constructor( list, store, areas ) {
    this.list = list;
    this.store = store;
    this.areas = areas;
  }

  async call(argv) {
    const queue = new PQueue({concurrency: 2});
    var analysis = 'bike_infrastructure';
    var areas = this.areas.getAll();
    for (const area of areas) {
      if ( argv.areas
           && ! argv.areas.split(',').includes(area.getSlug()) ) {
        continue;
      }
      queue.add(async () => {
        console.log("Analysing", area.name);
        var timeSpan = null;
        if ( argv.timeSpan === '1y' ) {
          timeSpan = '1y';
        }
        if ( ! argv.cache ) {
          await this.list[analysis].refresh(area,timeSpan);
        }
        await this.list[analysis].start(area,timeSpan);
        console.log("Done Analysing", area.name);
      });
    }
    while (queue.size) {
      process.stdout.write("\r\x1b[K");
      process.stdout.write(queue.size + " jobs running");
      await delay(5000);
    }
  };
}
