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

    addRoad(0, 15, 600);   // 大门 - 体育馆
    addRoad(0, 5, 360);    // 大门 - 春华堂
    addRoad(0, 4, 520);    // 大门 - 行政楼
    addRoad(0, 6, 360);    // 大门 - 秋实堂
    addRoad(0, 16, 570);   // 大门 - 医工楼

    addRoad(16, 13, 190);  // 医工楼 - 道康园
    addRoad(13, 6, 300);   // 道康园 - 秋实堂
    addRoad(13, 3, 530);   // 道康园 - 校医室

    addRoad(3, 1, 350);    // 校医室 - 图书馆
    addRoad(1, 4, 180);    // 图书馆 - 行政楼

    addRoad(4, 6, 280);    // 行政楼 - 秋实堂
    addRoad(4, 5, 280);    // 行政楼 - 春华堂

    addRoad(5, 2, 220);    // 春华堂 - 食堂
    addRoad(2, 14, 350);   // 食堂 - 操场

    addRoad(14, 15, 200);  // 操场 - 体育馆

    addRoad(14, 9, 390);   // 操场 - 春晖园
    addRoad(14, 10, 400);  // 操场 - 春霖园

    addRoad(9, 10, 50);    // 春晖园 - 春霖园
    addRoad(10, 7, 180);   // 春霖园 - 如意坊

    addRoad(7, 2, 50);     // 如意坊 - 食堂

    addRoad(2, 11, 150);   // 食堂 - 春草园
    addRoad(11, 8, 190);   // 春草园 - 春语园

    addRoad(8, 12, 200);   // 春语园 - 春风园
    addRoad(8, 10, 150);   // 春语园 - 春霖园

    addRoad(11, 12, 80);   // 春草园 - 春风园
    addRoad(12, 3, 200);   // 春风园 - 校医室


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
