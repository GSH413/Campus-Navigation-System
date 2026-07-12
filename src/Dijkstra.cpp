#include "../include/Dijkstra.h"

#include <iostream>
#include <stack>

using namespace std;

void printPath(int end,const vector<int>& pre,const vector<Spot>& spots){// 打印最短路径
    stack<int> path;
    bool first = true;
    int current = end;
    while (current != -1) {
        path.push(current);
        current = pre[current];
    }
    cout << "最短路径: ";
    while (!path.empty()) {
        if (!first) {
            cout << " -> ";
        }
        cout << spots[path.top()].name;
        first = false;
        path.pop();
    }
    cout << endl;
}

void dijkstra(int start, int end, const vector<Spot>& spots) {
    vector<int> dist(spots.size(), INF); // 存储从起点到各点的最短距离
    vector<bool> visited(spots.size(), false); // 标记是否已访问
    vector<int> pre(spots.size(), -1); // 存储最短路径的前驱节点
    dist[start] = 0; // 起点到自己的距离为0

    for (int i = 0; i < spots.size(); ++i) {// 遍历所有节点
        int u = -1;
        for (int j = 0; j < spots.size(); ++j) {
            if (!visited[j] && (u == -1 || dist[j] < dist[u])) {
                u = j;
            }
        }

        if (u==-1 || dist[u] == INF) break; // 剩余节点不可达
        visited[u] = true;

        for (int v = 0; v < spots.size(); ++v) {// 遍历所有邻接节点
            if (graph[u][v] != INF && dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
                pre[v] = u;
            }
        }
    }

    cout << "从" << spots[start].name << "出发" << endl;
    cout << "到" << spots[end].name << "的最短距离为: " << dist[end] << "米" << endl;
    if(dist[end]==INF) {
        cout << "从" << spots[start].name << "到" << spots[end].name << "不可达。" << endl;
        }
    else{
        printPath(end, pre, spots);
    }

}