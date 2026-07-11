#include <iostream>
#include <vector>
#include "../include/Spot.h"
#include "../include/Graph.h"
#include "../include/Dijkstra.h"
#include "../include/Menu.h"
#include "../include/DataLoader.h"
using namespace std;



// 主函数
int main(){
    vector<Spot> spots;// 存储景点信息的向量

    if (!loadSpots(spots)) {// 从文件加载景点信息
        cerr << "加载景点信息失败" << endl;
        return 1;
    }

    initGraph();// 初始化校园道路

    if (!loadRoads()) {// 从文件加载道路信息
        cerr << "加载道路信息失败" << endl;
        return 1;
    }

    menu(spots);// 显示菜单并处理用户输入

    return 0;
}
