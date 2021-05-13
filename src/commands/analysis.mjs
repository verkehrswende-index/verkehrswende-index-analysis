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
    const queue = new PQueue({concurrency: 1});
    var analysis = argv.analysis;
    var areas = this.areas.getAll();
    var timeSpan = null;
    if ( argv.timeSpan === '1y' ) {
      timeSpan = '1y';
    }
    for (const areaX of areas) {
      const area = this.areas.getArea(areaX.getSlug());
      if ( argv.areas
           && ! argv.areas.split(',').includes(area.getSlug()) ) {
        continue;
      }
      queue.add(async () => {
        console.log("Analysing", area.name);
        if ( ! argv.cache ) {
          if ( this.list[analysis].refresh ) {
            await this.list[analysis].refresh(area,timeSpan);
          }
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
