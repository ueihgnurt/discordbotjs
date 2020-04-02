class Test {

  isEnd = false;
  num = 0;

  async loop() {
    return new Promise(async r => {
      this.num += 1;
      console.log(`loop(${this.num})`)

      if (this.isEnd) {
        r();
        return;
      }
      await this.process().catch((e) => console.error(e));
      await this.process2().catch((e) => console.error(e));
      r(this.loop());
    })
  }

  async process() {
    console.log('process');
    return new Promise(async r => {
      setTimeout(r, 1500);
    })
  }

  async process2() {
    console.log('process2');
    return new Promise(async r => {
      setTimeout(r, 1500);
    })
  }
}