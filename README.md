# Pdnode Status Panel
由Pdnode团队开发的状态面板。

**注意此状态面板并不成熟，很可能有bug以及安全风险。请谨慎使用！**

目前功能：
- 显示内存占用
- 显示CPU以及每个核的CPU占用
- 显示系统负载平均（**目前此功能只对linux/macos有效**）

## 使用

### 源代码运行
**运行环境要求**
- node 18+
- git
- systemd (可选)

1. 拉取代码：`git clone github.com/bretren/status.git`
2. 运行代码：`node server.js`
3. 持久化运行：
   - `sudo nano /etc/systemd/system/status.service`
   - ```
      [Unit]
      Description=Pdnode Status Server
      After=network.target
      
      [Service]
      Type=simple
      User=root
      WorkingDirectory=/root/status
      ExecStart=/usr/local/bin/node server.js
      Restart=always
      RestartSec=5
      StandardOutput=syslog
      StandardError=syslog
      Environment=NODE_ENV=production
      
      [Install]
      WantedBy=multi-user.target
      ```
   - ```bash
     sudo systemctl daemon-reload
     sudo systemctl restart status
     sudo systemctl status status
      ```
**教程可能出错，请自行寻找原因。或者查看常见问题**

### apt安装（仅Linux）
敬请期待

### 使用已构建代码安装
**注意：有时候没有macos版本，请使用其它方法**
1. 前往 `https://github.com/BretRen/status/releases` 下载适合你的系统的最新版
2. 运行程序
3. 持久化 - 请自行解决。

### Docker安装
**并不建议使用此方法，此方法并没有得到验证**
github存储库有docker文件请自行构建。
（docker文件大概率有错误，建议自建。程序并不复杂）
