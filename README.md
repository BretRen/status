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
**教程可能出错，请自行寻找原因。或者查看[常见问题](#qa)**

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

## Q&A
### Q: 程序运行失败了
- 如果使用docker安装那么请自行解决或者[提交问题/反馈](https://github.com/BretRen/status/issues)
- 源代码运行失败
  - 持久化出错：
    - 检查环境有没有配置好
    - 检查对应的文件夹是不是对的
    - 检查systemd是否有权限
    - 检查端口是否被占用
  - 直接运行代码：
    - 检查是否有执行权限
    - 检查端口是否被占用
- 使用已构建代码安装
   - 检查是否有执行权限
   - 检查端口是否被占用
- 使用apt安装
   - 检查是否有执行权限
   - 检查端口是否被占用
   - 建议使用[源代码运行](#源代码运行)或者[已构建代码安装](#使用已构建代码安装)

### Q: 什么时候更新？
不知道，如果有空或者人用的多会更新的

### Q: 程序出错了
请先前往[Q: 程序运行失败了](#q-程序运行失败了)

自行解决如果解决不了请[提交问题/反馈](https://github.com/BretRen/status/issues)


### Q: 采用什么开源协议？
采用GPL-3.0开源协议，开源协议暂未包含到项目中。

### Q: 发现程序错误或者bug？
非常感谢！请[提交问题/反馈](https://github.com/BretRen/status/issues)