const { Server } = require("socket.io");
const http = require("http");
const os = require("os");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // 允许所有来源访问
  },
});

function calculateCpuUsage(startCpus, endCpus) {
  const usagePercentages = [];

  for (let i = 0; i < startCpus.length; i++) {
    const start = startCpus[i].times;
    const end = endCpus[i].times;

    const idleDiff = end.idle - start.idle;
    const totalStart = Object.values(start).reduce((a, b) => a + b, 0);
    const totalEnd = Object.values(end).reduce((a, b) => a + b, 0);
    const totalDiff = totalEnd - totalStart;

    const usage = totalDiff === 0 ? 0 : (1 - idleDiff / totalDiff) * 100;
    usagePercentages.push(+usage.toFixed(1));
  }

  return usagePercentages;
}

function getSystemInfo(prevCpuInfo) {
  const currentCpuInfo = os.cpus();
  const perCpuUsage = calculateCpuUsage(prevCpuInfo, currentCpuInfo);

  return {
    totalmem: os.totalmem(),
    freemem: os.freemem(),
    loadavg: os.loadavg(),
    uptime: os.uptime(),
    perCpuUsage,
    currentCpuInfo,
  };
}

let prevCpuInfo = os.cpus();

io.on("connection", (socket) => {
  console.log("客户端连接:", socket.id);

  // 先发一次状态信息
  const initInfo = getSystemInfo(prevCpuInfo);
  prevCpuInfo = initInfo.currentCpuInfo;
  socket.emit("status", initInfo);

  // 定时发送状态信息
  const interval = setInterval(() => {
    const info = getSystemInfo(prevCpuInfo);
    prevCpuInfo = info.currentCpuInfo;
    socket.emit("status", info);
  }, 3000);

  socket.on("disconnect", () => {
    clearInterval(interval);
    console.log("客户端断开:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Socket.IO 服务运行在 http://localhost:3001");
});
