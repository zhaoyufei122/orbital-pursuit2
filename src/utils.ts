import type { Pos } from './types';

// --- 纯数学魔法：计算水平矩形网格的坐标 ---
// 修改为矩形映射：线性映射 col -> x, row -> y
// 坐标系调整：y=0 对应顶部，y=MAX 对应底部，屏幕坐标系习惯。
// 但逻辑坐标系：y=0 是最小行，y=MAX 是最大行。
// 之前为了视觉上中间行是0，上正下负，做了一些处理。
// 现在要求：上负下正，符合轨道力学（低轨道周期短速度快，高轨道周期长速度慢？或者反过来？）
// 通常低轨道(高度低)速度快，高轨道速度慢。
// 在这个游戏中，中心是GEO，上方是高轨（漂移负，向西），下方是低轨（漂移正，向东）。
// 之前逻辑：
// centerOrb = (gridH - 1) / 2
// dx = selectedY - centerOrb
// 如果 selectedY > centerOrb (上方/高轨)，dx > 0 (向东漂移) -> 这其实反了，高轨应该更慢，相对地球向西漂移(负)
// 除非这是相对坐标系。
// 让我们重新定义：
// y 轴：0 (Top) -> H-1 (Bottom)
// Center = Mid
// y < Center (Top, High Orbit?) -> Should drift West (Negative)?
// y > Center (Bottom, Low Orbit?) -> Should drift East (Positive)?

// 现行代码逻辑：
// moveDxFromOrb = selectedY - centerOrb
// 例如 gridH=11, center=5
// y=0 (Top): dx = -5 (West/Left)
// y=10 (Bottom): dx = +5 (East/Right)
// 这意味着 Top 是 "West Drift / Slower / High Orbit?"
// Bottom 是 "East Drift / Faster / Low Orbit?"
// 如果我们认为 y=0 是屏幕上方，那么上方轨道向左漂移，下方轨道向右漂移。
// 如果要“上负下正”，指的可能是行索引的物理意义，或者漂移量的方向。
// 现有的 `moveDxFromOrb` 已经是：y越小（上），dx越负；y越大（下），dx越正。
// 这已经符合 "上负下正" 的漂移规律。

// 至于地图渲染，HTML 默认就是 y=0 在上。
// 所以 `getCurvedPos` 不需要改动，它忠实反映 grid 坐标。
// 视觉上 y=0 在最上面。

export const getCurvedPos = (x: number, y: number) => {
  // 定义单元格大小和边距
  const CELL_SIZE = 42; // 格子大小
  const OFFSET_X = 50;  // 左边距
  const OFFSET_Y = 50;  // 上边距

  return {
    x: x * CELL_SIZE + OFFSET_X,
    y: y * CELL_SIZE + OFFSET_Y,
    rotate: 0, // 矩形网格不旋转
  };
};

// 计算椭圆判定：点 (x, y) 是否在以 (cx, cy) 为中心，半径为 (rx, ry) 的椭圆内
export const isPointInEllipse = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) => {
  if (rx <= 0 || ry <= 0) return false;
  const normalizedDistSq = Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2);
  return normalizedDistSq <= 1;
};

// 计算切比雪夫距离 (Chebyshev distance)
export const chebyshevDist = (p1: Pos, p2: Pos) =>
  Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));

// 计算椭圆加权距离 (Physical Distance Proxy)
// 返回值不是真实公里数，而是归一化的“椭圆半径单位”
// 判定条件：dist <= 1.0 表示在椭圆内
export const getEllipticalDistance = (p1: Pos, p2: Pos, rx: number, ry: number) => {
    if (rx <= 0 || ry <= 0) return Infinity;
    const dx = Math.abs(p1.x - p2.x);
    const dy = Math.abs(p1.y - p2.y);
    return Math.sqrt(Math.pow(dx / rx, 2) + Math.pow(dy / ry, 2));
};

// 计算中心轨道索引
export const moveDxFromOrb = (selectedY: number, gridH: number) => {
  const centerOrb = (gridH - 1) / 2;
  return selectedY - centerOrb;
};

// 预计算网格坐标（已移除，改为实时计算以支持多模式）
export const posOf = (x: number, y: number) => getCurvedPos(x, y);
