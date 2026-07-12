Campus Navigation System

一、项目简介

本项目是一个基于 C++ 实现的校园导览系统，主要用于完成数据结构课程设计任务。

系统将校园中的地点抽象为图的顶点，将地点之间的道路抽象为图的边，边的权值表示两地点之间的距离。用户可以通过系统查询校园地点信息、道路信息，并使用 Dijkstra 算法查询两个地点之间的最短路径。

项目目前已完成命令行版本的核心功能，并对代码进行了模块化拆分，支持从文件读取地点和道路数据，支持管理员对道路和地点信息进行维护。

⸻

二、项目功能

1. 普通用户功能

普通用户可以使用以下功能：

1. 查看所有校园地点
2. 查询指定地点信息
3. 查询两个地点之间是否存在直接道路
4. 查询两个地点之间的最短路径

2. 管理员功能

管理员登录后可以使用以下功能：

1. 修改道路距离
2. 关闭某条道路
3. 恢复某条道路
4. 修改地点信息
5. 增加道路

管理员对道路或地点信息的修改会保存到对应的数据文件中，程序重新运行后仍然有效。

⸻

三、技术与数据结构

本项目主要使用以下技术和数据结构：

* C++
* 结构体 struct
* vector
* 邻接矩阵
* 栈 stack
* 文件读取与写入
* Dijkstra 最短路径算法
* 模块化程序设计

⸻

四、图结构设计

系统使用图结构表示校园地图。

1. 顶点设计

每个校园地点使用 Spot 结构体表示：

struct Spot {
    int id;
    string name;
    string description;
    int x;
    int y;
};

其中：

* id：地点编号
* name：地点名称
* description：地点介绍
* x：地点在校园地图图片中的横坐标
* y：地点在校园地图图片中的纵坐标

2. 边设计

道路使用邻接矩阵 graph[MAXN][MAXN] 表示。

graph[i][j]

表示地点 i 到地点 j 的距离。

如果两个地点之间没有道路，则用 INF 表示不可达。

⸻

五、算法设计

Dijkstra 最短路径算法

系统使用 Dijkstra 算法计算两个地点之间的最短路径。

算法中主要使用：

* dist[]：记录起点到每个地点的当前最短距离
* visited[]：记录地点是否已经被确定最短距离
* pre[]：记录路径中的前驱节点，用于恢复完整路径

路径恢复时，系统通过 pre[] 数组从终点反向查找起点，并使用栈将路径顺序输出。

⸻

六、项目结构

Campus-Navigation-System/
├── assets/
│   ├── spots.txt
│   └── roads.txt
│
├── include/
│   ├── Spot.h
│   ├── Graph.h
│   ├── Dijkstra.h
│   ├── Menu.h
│   └── DataLoader.h
│
├── src/
│   ├── main.cpp
│   ├── Spot.cpp
│   ├── Graph.cpp
│   ├── Dijkstra.cpp
│   ├── Menu.cpp
│   └── DataLoader.cpp
│
├── tools/
│   └── coordinate_picker.html
│
├── README.md
└── .gitignore

⸻

七、模块说明

1. Spot 模块

相关文件：

include/Spot.h
src/Spot.cpp

主要功能：

* 定义校园地点结构体
* 显示所有地点
* 根据地点名称查找地点编号

⸻

2. Graph 模块

相关文件：

include/Graph.h
src/Graph.cpp

主要功能：

* 初始化邻接矩阵
* 添加道路
* 查询道路
* 修改道路距离
* 关闭道路
* 恢复道路

⸻

3. Dijkstra 模块

相关文件：

include/Dijkstra.h
src/Dijkstra.cpp

主要功能：

* 计算最短路径
* 输出最短路径
* 通过前驱数组恢复路线

⸻

4. Menu 模块

相关文件：

include/Menu.h
src/Menu.cpp

主要功能：

* 主菜单
* 普通用户菜单
* 管理员菜单
* 管理员登录
* 用户输入与功能调用

⸻

5. DataLoader 模块

相关文件：

include/DataLoader.h
src/DataLoader.cpp

主要功能：

* 从 spots.txt 读取地点信息
* 从 roads.txt 读取道路信息
* 保存修改后的地点信息
* 保存修改后的道路信息

⸻

八、数据文件格式

1. 地点数据文件

文件路径：

assets/spots.txt

格式：

id|地点名称|地点介绍|x坐标|y坐标

示例：

0|大门|学校入口|123|678
1|图书馆|自习的地方|456|321
16|医工楼|生物医学工程学院所在地|850|420

说明：

地点数据使用 | 作为分隔符，避免地点介绍中出现空格时读取错误。

⸻

2. 道路数据文件

文件路径：

assets/roads.txt

格式：

起点ID 终点ID 距离

示例：

0 15 600
0 5 360
5 2 220

说明：

道路数据由三个数字组成，分别表示起点编号、终点编号和道路距离。

⸻

九、地图坐标说明

系统中的 x 和 y 坐标用于后续前端地图可视化。

坐标采用图片像素坐标：

左上角为 (0, 0)
向右 x 增大
向下 y 增大

后续前端可以根据地点坐标在校园地图图片上显示地点标记，并根据最短路径结果实现路线高亮。

项目中可以使用 tools/coordinate_picker.html 工具从校园地图图片中拾取地点像素坐标。

⸻

十、编译与运行

1. 编译

当前可以使用以下命令编译：

g++ src/main.cpp src/Spot.cpp src/Graph.cpp src/Dijkstra.cpp src/Menu.cpp src/DataLoader.cpp -Iinclude -o campus

2. 运行

./campus

⸻

十一、当前已完成功能

* 校园地点建模
* 校园道路建模
* 邻接矩阵存储图结构
* 地点信息查询
* 道路信息查询
* Dijkstra 最短路径查询
* 最短路径输出
* 普通用户菜单
* 管理员菜单
* 管理员道路维护
* 管理员地点信息维护
* 地点数据文件读取
* 道路数据文件读取
* 地点数据保存
* 道路数据保存
* 项目模块化拆分

⸻

十二、后续开发计划

后续计划包括：

1. 添加 Makefile，简化编译命令
2. 根据校园地图图片完善地点真实坐标
3. 制作前端地图界面
4. 在地图上显示地点标记
5. 根据最短路径结果高亮路线
6. 整理课程设计报告和答辩 PPT

⸻

十三、项目特点

本项目的主要特点包括：

1. 使用图结构建模校园道路网络
2. 使用 Dijkstra 算法实现最短路径查询
3. 使用文件保存地点和道路数据，提高可维护性
4. 区分普通用户和管理员权限
5. 支持道路动态维护和数据持久化
6. 预留地图坐标字段，方便后续前端可视化开发

---

## 十四、图形化前端说明

项目已新增独立的 Electron 图形化前端，目录为：

```text
frontend/
├── package.json
├── main.js
├── preload.js
├── data-adapter.js
├── index.html
├── styles.css
├── renderer.js
├── test-data.js
└── README.md
```

前端只作为普通用户可视化界面使用，不提供管理员维护功能，不修改 `src/`、`include/` 或 `assets/*.txt` 中的后端和数据文件。管理员仍通过原 C++ 命令行程序维护地点与道路数据。

### 1. 前端技术栈

* Electron
* HTML
* CSS
* JavaScript
* SVG 路线覆盖层

Electron 主窗口使用安全配置：

```javascript
contextIsolation: true
nodeIntegration: false
```

渲染进程通过 `preload.js` 暴露的最小接口读取项目内必要资源，不直接获得完整 Node.js 权限。

### 2. 前端读取的数据文件

前端读取以下项目内资源：

```text
assets/spots.txt
assets/roads.txt
assets/road_geometry.json
assets/校园地图.png
```

其中：

* `spots.txt` 保存地点编号、名称、介绍和地图像素坐标。
* `roads.txt` 保存无向道路及其权值，Dijkstra 最短路径仍只依据该文件中的距离计算。
* `road_geometry.json` 保存每条道路在地图上的真实折线坐标，只用于路线高亮绘制，不参与最短路径选路。
* `校园地图.png` 为前端展示使用的校园地图原图。

### 3. 路线高亮方式

前端查询路线时流程如下：

```text
读取 spots.txt 和 roads.txt
构建道路图
使用 Dijkstra 计算最短路径节点序列
根据相邻节点从 road_geometry.json 获取真实道路折线
使用 SVG polyline 在地图上高亮完整路线
```

`road_geometry.json` 的道路键采用无向格式：

```text
较小地点ID-较大地点ID
```

例如地点 `2` 和地点 `5` 之间的道路键为：

```text
2-5
```

如果查询方向与 JSON 保存方向相反，前端会复制折线点数组并反转后绘制，不会修改原始 JSON 数据。

如果某条道路在 `roads.txt` 中存在但在 `road_geometry.json` 中缺失，前端会临时使用两个地点坐标之间的直线降级显示，并在界面和开发者控制台提示缺失的道路键。

### 4. 前端安装与启动

进入前端目录：

```bash
cd frontend
```

安装依赖：

```bash
npm install
```

启动开发版：

```bash
npm run dev
```

或：

```bash
npm start
```

可选 Windows 打包命令：

```bash
npm run build:win
```

### 5. 前端数据测试

前端提供数据与路径测试脚本：

```bash
node test-data.js
```

该脚本会验证：

* `spots.txt` 是否能读取。
* `roads.txt` 是否能读取。
* `road_geometry.json` 是否能读取。
* Dijkstra 是否能计算示例路线。
* 正向道路几何是否能绘制。
* 反向道路几何是否能自动反转。
* 多段路线几何是否能拼接。
* 缺失几何时是否能降级处理。

当前示例路线：

```text
大门 -> 春语园
```

在当前数据下结果为：

```text
大门 -> 春华堂 -> 食堂 -> 春草园 -> 春语园
最短距离：920 米
```

### 6. 命令行后端仍可独立运行

原 C++ 命令行版本仍使用原方式编译和运行：

```bash
g++ src/main.cpp src/Spot.cpp src/Graph.cpp src/Dijkstra.cpp src/Menu.cpp src/DataLoader.cpp -Iinclude -o campus
./campus
```

前端和后端彼此独立：前端只读数据文件进行展示，后端仍负责命令行交互和管理员维护。
