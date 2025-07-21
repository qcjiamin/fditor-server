import Stream from "node:stream";
import fs from 'node:fs'
import zlib from 'node:zlib'


// 创建自定义可读流类
class MyReadableStream extends Stream.Readable {
  constructor(options) {
    super(options);
    this.data = ['Hello', 'World', 'from', 'Readable', 'Stream'];
    this.index = 0;
  }

  // 必须实现的 _read 方法，用于提供数据
  _read(size) {
    if (this.index >= this.data.length) {
      // 数据耗尽，推送 null 表示流结束
      this.push(null);
    } else {
      // 推送数据到流中
      const chunk = this.data[this.index];
      this.push(chunk);
      this.index++;
    }
  }
}

function run(){
    const fileStream = fs.createWriteStream('write.text')
    const consoleStream = process.stdout

    // 使用示例
    const stream = new MyReadableStream()
    stream.pipe(consoleStream)
    stream.pipe(fileStream)
}

run()