#ifndef DIJKSTRA_H
#define DIJKSTRA_H

#include <vector>
#include "Spot.h"
#include "Graph.h"

using namespace std;


// 输出路径
void printPath(
    int end,
    const vector<int>& pre,
    const vector<Spot>& spots
);


// Dijkstra最短路径算法
void dijkstra(
    int start,
    int end,
    const vector<Spot>& spots
);


#endif