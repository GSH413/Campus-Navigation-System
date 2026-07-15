# 校园导览系统（Campus Navigation System）

一个基于 C++ 与 Electron 开发的校园地图导航系统，支持地点查询、最短路径规划、真实道路折线高亮和校园数据管理。

## 项目简介

本项目将校园地点表示为图的顶点，将地点之间的道路表示为带权无向边，可通过命令行程序或 Electron 图形界面使用。

普通用户可以搜索地点、选择起点和终点，并在校园地图上查看最短路线。管理员可以维护地点与道路数据、临时关闭或恢复道路，并检查地图数据完整性。

项目主要使用 C++、Electron、HTML、CSS 和 JavaScript，图数据采用邻接矩阵组织，路径规划使用 Dijkstra 算法，道路形状由 JSON 折线数据提供。

## 功能展示

- **身份选择**：启动后可进入用户模式或管理员模式。
- **地点查询**：按名称搜索地点并查看地点介绍和地图坐标。
- **路线规划**：选择起点和终点，计算并展示最短路径。
- **地图导航**：显示地点标记，通过 SVG 高亮真实道路折线。
- **地图交互**：支持缩放、拖动、复位和地点定位。
- **地点管理**：管理员可查看和修改地点名称、介绍及坐标。
- **道路管理**：管理员可新增道路、修改距离、临时关闭和恢复道路。
- **数据概况**：展示地点、道路、几何数据和地图连通状态。
- **完整性检查**：检查孤立地点、无效道路、缺失几何和异常坐标。
- **命令行模式**：提供独立的 C++ 菜单式查询与管理程序。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 核心程序 | C++ 17 |
| 桌面应用 | Electron 31 |
| 前端 | HTML、CSS、JavaScript |
| 地图绘制 | SVG、PNG |
| 图结构 | 邻接矩阵、无向带权图 |
| 路径规划 | Dijkstra |
| 数据格式 | TXT、JSON |
| 构建工具 | Make、npm、electron-builder |

## 项目结构

```text
Campus-Navigation-System/
├── assets/                     # 校园地图、地点、道路和道路几何数据
│   ├── spots.txt
│   ├── roads.txt
│   ├── road_geometry.json
│   └── 校园地图.png
├── frontend/                   # Electron 图形界面
│   ├── data/                   # 管理端道路关闭状态
│   ├── entry.html              # 用户/管理员身份选择页
│   ├── index.html              # 用户地图页
│   ├── admin.html              # 管理员管理中心
│   ├── main.js                 # Electron 主进程
│   ├── preload.js              # 安全 API 桥接
│   ├── renderer.js             # 用户端交互
│   ├── admin.js                # 管理端交互
│   └── package.json            # 前端依赖与运行脚本
├── include/                    # C++ 头文件
├── src/                        # C++ 源文件
├── tools/                      # 坐标与道路几何采集工具
│   ├── coordinate_picker.html
│   └── road-geometry-picker.html
├── Makefile                    # C++ 构建配置
└── README.md
```

## 环境要求

### 必需软件

| 软件 | 用途 | 建议版本 |
| --- | --- | --- |
| Git | 下载项目 | 最新稳定版 |
| Node.js | 运行 Electron 和安装依赖 | 18 或更高版本 |
| npm | 安装前端依赖 | 随 Node.js 安装 |
| g++ | 编译 C++ 程序 | 支持 C++ 17 |
| Make | 使用项目 Makefile | 可选，可用 g++ 命令代替 |

Electron 不需要单独全局安装，执行 `npm install` 后会安装项目指定版本。

### Windows

建议安装：

- [Git for Windows](https://git-scm.com/download/win)
- [Node.js LTS](https://nodejs.org/)
- MSYS2/MinGW-w64，或其他支持 C++ 17 的 g++ 环境

安装后在 PowerShell 或终端检查：

```powershell
git --version
node --version
npm --version
g++ --version
```

### macOS

安装 Node.js LTS，并通过 Xcode Command Line Tools 获取编译工具：

```bash
xcode-select --install
```

检查环境：

```bash
git --version
node --version
npm --version
g++ --version
make --version
```

### Linux

以 Ubuntu/Debian 为例：

```bash
sudo apt update
sudo apt install git build-essential
```

Node.js 建议从 Node.js 官方渠道安装 LTS 版本。

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/GSH413/Campus-Navigation-System.git
cd Campus-Navigation-System
```

### 2. 安装 Electron 前端依赖

```bash
cd frontend
npm install
```

首次安装需要下载 Electron，完成后无需重复安装。

### 3. 编译 C++ 程序

返回项目根目录：

```bash
cd ..
make
```

如果系统没有 `make`，可直接执行：

```bash
g++ -std=c++17 src/main.cpp src/Spot.cpp src/Graph.cpp src/Dijkstra.cpp src/Menu.cpp src/DataLoader.cpp -Iinclude -o campus
```

Windows 下可以将输出文件改为 `campus.exe`：

```powershell
g++ -std=c++17 src/main.cpp src/Spot.cpp src/Graph.cpp src/Dijkstra.cpp src/Menu.cpp src/DataLoader.cpp -Iinclude -o campus.exe
```

### 4. 启动 Electron 图形界面

```bash
cd frontend
npm run dev
```

应用启动后会首先显示身份选择页。选择“用户模式”即可打开校园地图。

### 5. 运行 C++ 命令行程序（可选）

必须从项目根目录运行，程序才能正确读取 `assets/`：

macOS / Linux：

```bash
./campus
```

Windows：

```powershell
./campus.exe
```

### 启动检查清单

- [ ] 身份选择页正常显示
- [ ] 用户模式能够加载校园地图
- [ ] 地点标记和搜索结果正常显示
- [ ] 选择起点、终点后能够生成路线
- [ ] 管理员模式能够打开登录页

## 使用说明

### 普通用户

1. 启动应用并选择 **用户模式**。
2. 在“地点查询”中输入地点名称，点击结果可定位到地图标记。
3. 在“路线查询”中选择起点和终点。
4. 点击 **查询路线**，右侧会显示最短距离和途经地点。
5. 地图上的高亮折线表示规划结果；可使用滚轮、滑块或地图控制按钮调整视图。
6. 点击 **刷新数据** 可重新读取地点、道路和几何文件。
7. 点击 **返回身份选择** 可切换模式，点击 **退出** 可关闭窗口。

### 管理员

1. 在身份选择页选择 **管理员模式**。
2. 输入管理员密码 `admin123` 并登录。
3. 在左侧导航进入“数据概况”“地点管理”“道路管理”或“数据检查”。
4. 编辑地点或道路后，在表单中点击保存。
5. 临时关闭道路前需要确认；已关闭道路可在道路管理页恢复。
6. 修改完成后可进入用户模式预览最新地图数据。

> 管理员功能会写入项目数据文件。修改前建议通过 Git 提交或备份当前数据。

## 数据文件说明

| 文件 | 作用 | 基本格式 |
| --- | --- | --- |
| `assets/spots.txt` | 保存地点 ID、名称、介绍和地图坐标 | `id\|名称\|介绍\|x\|y` |
| `assets/roads.txt` | 保存两个地点之间的道路距离 | `起点ID 终点ID 距离` |
| `assets/road_geometry.json` | 保存道路在地图上的真实折线坐标 | 无向道路键对应坐标点数组 |
| `frontend/data/closed_roads.json` | 保存管理员临时关闭的道路及原距离 | JSON 对象 |

用户界面和管理员界面共用以上数据，不需要维护第二套地点或道路文件。

## 管理员功能

管理员可以：

- 查看地图数据概况和加载状态。
- 搜索并修改地点名称、介绍和坐标。
- 查看、新增道路以及修改道路距离。
- 临时关闭道路并保留原距离，之后恢复道路。
- 查看每条道路是否配置几何折线。
- 检查地图连通性、孤立地点、无效道路和异常坐标。
- 打开现有道路几何采集工具。

## 开发说明

### 增加或修改地点

优先使用管理员界面的“地点管理”，也可以按既有格式编辑：

```text
assets/spots.txt
```

地点坐标以 `assets/校园地图.png` 的原始像素尺寸为基准。

### 增加或修改道路

优先使用管理员界面的“道路管理”，数据保存在：

```text
assets/roads.txt
```

新增道路后如果没有对应几何，用户界面会使用地点之间的直线作为降级显示。

### 更换校园地图

替换以下图片，并重新确认所有地点坐标：

```text
assets/校园地图.png
```

### 更新道路几何

使用现有采集工具：

```text
tools/road-geometry-picker.html
```

导出后检查并更新：

```text
assets/road_geometry.json
```

### 运行测试

```bash
cd frontend
npm test
```

测试包含数据加载、路径规划、管理员数据校验和可回滚写入检查。

### 构建 Windows 安装包

```bash
cd frontend
npm run build:win
```

构建结果输出到 `frontend/dist/`。

## 项目截图

> （此处放置身份选择页截图）

> （此处放置校园地图与路线导航截图）

> （此处放置管理员管理中心截图）

## 常见问题

### Electron 启动失败

确认已进入 `frontend/` 并安装依赖：

```bash
cd frontend
npm install
npm run dev
```

### 地图或地点没有显示

确认以下文件存在且格式正确：

```text
assets/校园地图.png
assets/spots.txt
assets/roads.txt
assets/road_geometry.json
```

### C++ 程序无法读取数据

请从项目根目录运行 `campus` 或 `campus.exe`，不要在 `src/` 目录内启动。

### 路线出现直线段

对应道路缺少有效的 `road_geometry.json` 折线数据。可使用 `tools/road-geometry-picker.html` 补充。

## License

MIT
