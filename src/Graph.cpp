#include "../include/Graph.h"

#include <iostream>

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