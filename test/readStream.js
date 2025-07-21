import {Readable} from 'stream'

// 创建自定义可读流类
class MyReadableStream extends Readable {
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

// 使用示例
const stream = new MyReadableStream();

// 监听 data 事件读取数据
stream.on('data', (chunk) => {
  console.log('接收到数据:', chunk.toString());
});

// 监听 end 事件处理流结束
stream.on('end', () => {
  console.log('流读取完成');
});    