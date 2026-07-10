#include <iostream>
#include <vector>
#include "../include/Spot.h"
#include "../include/Graph.h"
#include "../include/Dijkstra.h"
using namespace std;



void showgraph(){
    for(int i=0;i<MAXN ; i++){
        for(int j=0;j<MAXN; j++){
            cout<< graph[i][j] << " ";
        }
        cout << endl;
    }
}
    
// 查询景点信息
void querySpot(const vector<Spot>& spots) {
    int id= -1;
    while (id < 0 || id >= spots.size()) {
        cout <<"输入你要查询的地点id"<< endl;
        cin >> id;
        if (id < 0 || id>= spots.size()){
            cout << "请重新输入" << endl;
        }
    }
    cout << spots[id].name << "," << spots[id].description << endl;
}

void menu(const vector<Spot>& spots)
{

    int choice = 0;

    while(choice != 5)
    {
        cout << endl;
        cout << "========================" << endl;
        cout << "      校园导览系统       " << endl;
        cout << "========================" << endl;
        cout << "1. 查看所有地点" << endl;
        cout << "2. 查询地点信息" << endl;
        cout << "3. 查询道路信息" << endl;
        cout << "4. 查询最短路线" << endl;
        cout << "5. 退出系统" << endl;
        cout << "请输入你的选择:";

        cin >> choice;
        cin.clear(); // 清除输入流的错误状态
        cin.ignore(numeric_limits<streamsize>::max(), '\n'); // 忽略剩余输入


        switch(choice)
        {

        case 1:
            showAllSpots(spots);
            break;


        case 2:
            querySpot(spots);
            break;


        case 3:
        {
            int a,b;

            cout << "请输入起点ID:";
            cin >> a;

            cout << "请输入终点ID:";
            cin >> b;

            queryRoad(a,b,spots);

            break;
        }


       case 4:
        {
        string startName;
        string endName;

        cout << "请输入起点名称:";
        cin >> startName;

        cout << "请输入终点名称:";
        cin >> endName;


        int start = findSpotID(startName, spots);
        int end = findSpotID(endName, spots);


        if(start == -1 || end == -1)
        {
            cout << "地点不存在，请重新输入。" << endl;
        }
        else
        {
            dijkstra(start,end,spots);
        }


        break;
    
        }


        case 5:
        {
            cout << "感谢使用校园导览系统！" << endl;
            break;


        default:
            cout << "输入错误，请重新选择。" << endl;

        }

    }
    }
}


// 主函数
int main(){
    vector<Spot> spots;// 存储景点信息的向量

    initSpots(spots);// 初始化景点信息

    initGraph();// 初始化校园道路

    menu(spots);// 显示菜单并处理用户输入

    return 0;
}
