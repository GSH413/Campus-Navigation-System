#include "../include/Graph.h"

#include <iostream>
#include <queue>

using namespace std;


int graph[MAXN][MAXN];

void addRoad(int a,int b,int distance)
{

    graph[a][b]=distance;

    graph[b][a]=distance;

}



void initGraph()
{

    for(int i=0;i<MAXN;i++)
    {

        for(int j=0;j<MAXN;j++)
        {

            if(i==j)
                graph[i][j]=0;

            else
                graph[i][j]=INF;

        }

    }


}
void queryRoad(int a, int b,const vector<Spot>& spots) {
    if (a < 0 || a >= spots.size() || b < 0 || b >= spots.size()) {
        cout << "输入的景点ID无效，请重新输入。" << endl;
        return;
    }
    if (graph[a][b]==INF){
        cout << spots[a].name << "和" << spots[b].name<< "之间没有道路。" << endl;
    } else {
        cout  << spots[a].name << "和" << spots[b].name << "之间的道路距离为: " << graph[a][b] <<"米" << endl;
    }
}

void updateRoad(int a, int b, int distance)
{
    graph[a][b] = distance;
    graph[b][a] = distance;

    cout << "道路距离修改成功。" << endl;
}

void closeRoad(int a, int b)
{
    graph[a][b] = INF;
    graph[b][a] = INF;

    cout << "道路已关闭。" << endl;
}

void restoreRoad(int a, int b, int distance)
{
    graph[a][b] = distance;
    graph[b][a] = distance;

    cout << "道路已恢复。" << endl;
}

void showAllRoads(const vector<Spot>& spots)
{
    int roadCount = 0;

    cout << endl;
    cout << "========================================" << endl;
    cout << "              当前道路列表              " << endl;
    cout << "========================================" << endl;

    for (int i = 0; i < spots.size(); i++)
    {
        for (int j = i + 1; j < spots.size(); j++)
        {
            if (graph[i][j] != INF && graph[i][j] != 0)
            {
                roadCount++;

                cout << roadCount << ". "
                     << spots[i].name
                     << "（ID " << i << "）"
                     << " <-> "
                     << spots[j].name
                     << "（ID " << j << "）"
                     << "，距离："
                     << graph[i][j]
                     << " 米"
                     << endl;
            }
        }
    }

    if (roadCount == 0)
    {
        cout << "当前没有可用道路。" << endl;
    }
    else
    {
        cout << "----------------------------------------" << endl;
        cout << "道路总数：" << roadCount << endl;
    }
}

bool isGraphConnected(int spotCount)
{
    if (spotCount <= 0)
    {
        return false;
    }

    vector<bool> visited(spotCount, false);
    queue<int> waitingQueue;

    visited[0] = true;
    waitingQueue.push(0);

    int visitedCount = 0;

    while (!waitingQueue.empty())
    {
        int current = waitingQueue.front();
        waitingQueue.pop();

        visitedCount++;

        for (int next = 0; next < spotCount; next++)
        {
            if (
                graph[current][next] != INF &&
                graph[current][next] != 0 &&
                !visited[next]
            )
            {
                visited[next] = true;
                waitingQueue.push(next);
            }
        }
    }

    return visitedCount == spotCount;
}

void showDataSummary(const vector<Spot>& spots)
{
    int roadCount = 0;
    int isolatedCount = 0;

    for (int i = 0; i < spots.size(); i++)
    {
        bool hasRoad = false;

        for (int j = 0; j < spots.size(); j++)
        {
            if (
                i != j &&
                graph[i][j] != INF &&
                graph[i][j] != 0
            )
            {
                hasRoad = true;
            }

            if (
                j > i &&
                graph[i][j] != INF &&
                graph[i][j] != 0
            )
            {
                roadCount++;
            }
        }

        if (!hasRoad)
        {
            isolatedCount++;
        }
    }

    bool connected = isGraphConnected(
        static_cast<int>(spots.size())
    );

    cout << endl;
    cout << "========================================" << endl;
    cout << "              地图数据概况              " << endl;
    cout << "========================================" << endl;

    cout << "地点总数："
         << spots.size()
         << endl;

    cout << "可用道路总数："
         << roadCount
         << endl;

    cout << "孤立地点数量："
         << isolatedCount
         << endl;

    cout << "地图连通状态："
         << (connected ? "完全连通" : "存在不可达地点")
         << endl;
}