// 服务器管理相关代码
const servers = JSON.parse(localStorage.getItem("servers")) || [];
let currentServer = null;
let currentSocket = null;

// DOM 元素
const serverList = document.getElementById("server-list");
const noServerMessage = document.getElementById("no-server-message");
const serverStatus = document.getElementById("server-status");
const currentServerName = document.getElementById("current-server-name");

// 初始化UI
function initUI() {
  updateServerList();
  if (servers.length > 0) {
    noServerMessage.style.display = "none";
    serverStatus.style.display = "block";
    connectToServer(servers[0]);
  } else {
    noServerMessage.style.display = "block";
    serverStatus.style.display = "none";
  }
}

// 更新服务器下拉列表
function updateServerList() {
  serverList.innerHTML = "";

  if (servers.length === 0) {
    const emptyItem = document.createElement("div");
    emptyItem.className = "dropdown-item";
    emptyItem.textContent = "无服务器";
    emptyItem.style.color = "#888";
    emptyItem.style.cursor = "default";
    serverList.appendChild(emptyItem);
    return;
  }

  servers.forEach((server, index) => {
    const serverItem = document.createElement("div");
    serverItem.className = "dropdown-item";
    serverItem.innerHTML = `
            <div>${server.name}</div>
            <small>${server.address}</small>
            <div class="server-actions">
                <button class="delete-server" data-index="${index}">×</button>
            </div>
        `;

    serverItem.addEventListener("click", (e) => {
      if (!e.target.classList.contains("delete-server")) {
        connectToServer(server);
        document.querySelector(".dropdown").classList.remove("open");
      }
    });

    // 添加删除按钮事件
    const deleteBtn = serverItem.querySelector(".delete-server");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteServer(index);
    });

    serverList.appendChild(serverItem);
  });
}

// 连接到指定服务器
function connectToServer(server) {
  // 断开现有连接
  if (currentSocket) {
    currentSocket.disconnect();
  }

  currentServer = server;
  currentServerName.textContent = server.name;

  // 显示连接状态
  document.getElementById("cpu-details").textContent = "连接中...";

  // 建立新连接
  currentSocket = io(server.address, {
    transports: ["websocket"],
    reconnectionAttempts: 3,
    timeout: 5000,
  });

  // 设置事件监听器
  setupSocketListeners(currentSocket);
}

// 设置Socket.IO监听器
function setupSocketListeners(socket) {
  socket.on("connect", () => {
    console.log("已连接到服务器:", currentServer.name);
  });

  socket.on("connect_error", (error) => {
    console.error("连接错误:", error);
    document.getElementById("cpu-details").textContent = "连接失败";
  });

  socket.on("disconnect", (reason) => {
    console.log("断开连接:", reason);
  });

  socket.on("status", (data) => {
    updateMemory({
      totalmem: data.totalmem,
      freemem: data.freemem,
    });

    updateCpuLoad(data.perCpuUsage);
    updateLoadAvg(data.loadavg);

    if (data.uptime) {
      updateUptime(data.uptime);
    }

    const cpuCoreUsages = data.perCpuUsage || [];
    updateCpuCores(cpuCoreUsages);
  });
}

// 添加新服务器
function addServer(name, address) {
  // 验证地址格式
  if (!address.startsWith("http://") && !address.startsWith("https://")) {
    address = "http://" + address;
  }

  const newServer = {
    name,
    address: address.replace(/\/$/, ""), // 移除末尾的斜杠
  };

  servers.push(newServer);
  localStorage.setItem("servers", JSON.stringify(servers));

  if (servers.length === 1) {
    // 如果是第一个服务器，自动连接
    noServerMessage.style.display = "none";
    serverStatus.style.display = "block";
    connectToServer(newServer);
  }

  updateServerList();
}

// 删除服务器
function deleteServer(index) {
  if (currentServer && servers[index].name === currentServer.name) {
    if (currentSocket) {
      currentSocket.disconnect();
      currentSocket = null;
    }

    if (servers.length === 1) {
      noServerMessage.style.display = "block";
      serverStatus.style.display = "none";
    }
  }

  servers.splice(index, 1);
  localStorage.setItem("servers", JSON.stringify(servers));
  updateServerList();

  // 如果还有服务器，连接到第一个
  if (servers.length > 0 && !currentServer) {
    connectToServer(servers[0]);
  }
}

// 初始化模态框
const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");
const modal = document.getElementById("addServerModal");
const addServerBtn = document.getElementById("add-server-btn");

openModal.addEventListener("click", () => {
  modal.style.display = "flex";
  document.getElementById("server-name").focus();
});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// 点击背景区域关闭弹窗
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// 添加服务器按钮事件
addServerBtn.addEventListener("click", () => {
  const name = document.getElementById("server-name").value.trim();
  const address = document.getElementById("server-address").value.trim();

  if (name && address) {
    addServer(name, address);
    modal.style.display = "none";
    document.getElementById("server-name").value = "";
    document.getElementById("server-address").value = "";
  } else {
    alert("请填写服务器名称和地址");
  }
});

// 回车键提交表单
document.getElementById("server-address").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addServerBtn.click();
  }
});

// 下拉菜单切换
const toggleBtn = document.querySelector(".dropdown-toggle");
const dropdown = document.querySelector(".dropdown");

toggleBtn.addEventListener("click", () => {
  dropdown.classList.toggle("open");
});

// 点击外部关闭菜单
document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) {
    dropdown.classList.remove("open");
  }
});

// 工具函数
function bytesToGB(bytes) {
  return (bytes / 1024 / 1024 / 1024).toFixed(2);
}

function updateMemory(mem) {
  const totalGB = bytesToGB(mem.totalmem);
  const freeGB = bytesToGB(mem.freemem);
  const usedGB = (totalGB - freeGB).toFixed(2);
  const usedPercent = ((usedGB / totalGB) * 100).toFixed(1);

  document.getElementById("mem-used").textContent = `${usedPercent}%`;
  document.getElementById("mem-progress").style.width = usedPercent + "%";
  document.getElementById(
    "mem-details"
  ).textContent = `${usedGB} GB / ${totalGB} GB`;
}

function updateCpuLoad(perCpuUsage) {
  if (!perCpuUsage || perCpuUsage.length === 0) {
    document.getElementById("cpu-load").textContent = `N/A`;
    document.getElementById("cpu-progress").style.width = "0%";
    document.getElementById("cpu-details").textContent = `无 CPU 使用数据`;
    return;
  }
  const sum = perCpuUsage.reduce((a, b) => a + b, 0);
  const avg = (sum / perCpuUsage.length).toFixed(1);

  document.getElementById("cpu-load").textContent = `${avg}%`;
  document.getElementById("cpu-progress").style.width = avg + "%";
  document.getElementById("cpu-details").textContent = `每核CPU平均使用率`;
}

function updateLoadAvg(loadavg) {
  if (!loadavg || loadavg.length < 3) return;

  document.getElementById(
    "loadavg-values"
  ).textContent = `1min: ${loadavg[0].toFixed(2)}, 5min: ${loadavg[1].toFixed(
    2
  )}, 15min: ${loadavg[2].toFixed(2)}`;
}

function updateUptime(uptime) {
  if (!uptime) return;

  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  let uptimeStr = "";
  if (days > 0) uptimeStr += `${days}天 `;
  if (hours > 0 || days > 0) uptimeStr += `${hours}小时 `;
  if (minutes > 0 || hours > 0 || days > 0) uptimeStr += `${minutes}分 `;
  uptimeStr += `${seconds}秒`;

  document.getElementById("uptime-value").textContent = uptimeStr;
}

function updateCpuCores(usages) {
  const container = document.getElementById("cpu-cores");
  container.innerHTML = "";

  usages.forEach((percent, idx) => {
    const coreDiv = document.createElement("div");
    coreDiv.className = "cpu-core";

    // 创建进度条
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressBar.style.height = "6px";
    progressBar.style.marginTop = "6px";
    progressBar.style.backgroundColor = "#2a2a2a";

    const progress = document.createElement("div");
    progress.className = "progress";
    progress.style.height = "100%";
    progress.style.width = `${percent}%`;
    progress.style.backgroundColor =
      percent > 80 ? "#e91e63" : percent > 60 ? "#ff9800" : "#0bc";

    progressBar.appendChild(progress);

    coreDiv.textContent = `核心 ${idx + 1}: ${percent}%`;
    coreDiv.appendChild(progressBar);
    container.appendChild(coreDiv);
  });
}

// 初始化应用
initUI();
