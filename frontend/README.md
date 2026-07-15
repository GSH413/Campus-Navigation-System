# 校园导览系统图形化前端

## 技术栈

- Electron
- HTML
- CSS
- JavaScript
- SVG 路线覆盖层

前端位于独立的 `frontend/` 目录，不修改原有 C++ 后端源码。应用启动后可选择用户模式或管理员模式；用户模式保持原地图导览体验，管理员模式通过安全 IPC 维护现有数据文件。

## 目录结构

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

## 安装依赖

在项目根目录执行：

```bash
cd frontend
npm install
```

## 启动方法

```bash
npm run dev
```

也可以使用：

```bash
npm start
```

Windows 打包命令：

```bash
npm run build:win
```

## 地图图片放置位置

当前前端会优先从以下目录自动寻找地图图片：

```text
assets/
frontend/assets/
```

支持格式：`.png`、`.jpg`、`.jpeg`、`.webp`。

当前项目已检测到：

```text
assets/校园地图.png
```

前端直接读取该原图，不会压缩、裁剪或修改。

## 数据文件来源

用户端和管理员端共用现有数据文件：

```text
assets/spots.txt
assets/roads.txt
```

用户端只读；管理员端可在登录后修改地点、增加/修改/临时关闭及恢复道路。写入采用 UTF-8 临时文件校验后原子替换，并在 `frontend/backups/` 仅保留每类最近 5 份备份。关闭状态保存在 `frontend/data/closed_roads.json`，不会删除道路几何。

## 坐标系统说明

`spots.txt` 中的 `x`、`y` 是地图原始图片像素坐标：

- 左上角为 `(0, 0)`
- 向右为 x 正方向
- 向下为 y 正方向

渲染时按图片自然尺寸换算百分比：

```text
left = x / imageNaturalWidth
top  = y / imageNaturalHeight
```

因此窗口缩放、地图缩放和拖动时，地点标记与路线会保持对齐。

## 路线高亮原理

前端从 `roads.txt` 读取道路权值，构建与 C++ 后端一致的无向图，并使用 Dijkstra 算法计算最短路径。

查询成功后，前端按路径节点顺序把相邻地点坐标连接成 SVG `polyline`，覆盖在地图上方。SVG 使用地图原始尺寸作为 `viewBox`，因此缩放后仍保持清晰和准确。

## Windows 使用说明

1. 确认已安装 Node.js。
2. 在 PowerShell 或 VS Code 终端进入 `frontend/`。
3. 执行 `npm install`。
4. 执行 `npm run dev`。

项目路径中包含中文或空格时，Electron 通过 `__dirname` 和 `path.join(...)` 定位资源，仍可正常读取。

## 常见问题处理

- 地图未显示：确认 `assets/` 中存在 `.png/.jpg/.jpeg/.webp` 地图图片。
- 地点位置偏移：确认 `spots.txt` 中坐标来自原始地图图片，不是缩放后截图。
- 路线不可达：确认 `roads.txt` 中存在连接起点和终点所属连通分量的道路。
- 中文显示异常：前端会自动尝试 UTF-8 与 GB18030 解码，优先选择中文字符更多的结果。
- 启动失败：删除 `frontend/node_modules` 后重新执行 `npm install`。
