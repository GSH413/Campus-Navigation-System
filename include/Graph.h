#ifndef GRAPH_H
#define GRAPH_H

#include <vector>
#include "Spot.h"

using namespace std;


const int MAXN = 20;

const int INF = 99999999;


// 全局图变量声明
extern int graph[MAXN][MAXN];


// 初始化图
void initGraph();


// 添加道路
void addRoad(int a,int b,int distance);


// 查询道路
void queryRoad(int a,int b,const vector<Spot>& spots);

// 管理员道路维护功能

void updateRoad(int a, int b, int distance);

void closeRoad(int a, int b);

void restoreRoad(int a, int b, int distance);

// 显示当前所有道路
void showAllRoads(const vector<Spot>& spots);

// 使用 BFS 检查地图是否连通
bool isGraphConnected(int spotCount);

// 显示地图数据概况
void showDataSummary(const vector<Spot>& spots);
#endif