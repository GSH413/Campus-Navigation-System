#include "../include/Menu.h"
#include "../include/Graph.h"
#include "../include/Dijkstra.h"
#include "../include/DataLoader.h"

#include <iostream>
#include <limits>
#include <string>

using namespace std;


// 查询景点信息
void querySpot(const vector<Spot>& spots)
{
    int id = -1;

    while (id < 0 || id >= spots.size())
    {
        cout << "请输入你要查询的地点ID: ";
        cin >> id;

        if (id < 0 || id >= spots.size())
        {
            cout << "地点ID错误，请重新输入。" << endl;
        }
    }

    cout << "地点名称: " << spots[id].name << endl;
    cout << "地点介绍: " << spots[id].description << endl;
}


// 管理员登录
bool adminLogin()
{
    string password;

    cout << "请输入管理员密码: ";
    cin >> password;

    if (password == "admin123")
    {
        cout << "管理员登录成功。" << endl;
        return true;
    }
    else
    {
        cout << "管理员密码错误。" << endl;
        return false;
    }
}


// 普通用户菜单
void userMenu(const vector<Spot>& spots)
{
    int choice = 0;

    while (choice != 5)
    {
        cout << endl;
        cout << "========================" << endl;
        cout << "      普通用户菜单       " << endl;
        cout << "========================" << endl;
        cout << "1. 查看所有地点" << endl;
        cout << "2. 查询地点信息" << endl;
        cout << "3. 查询道路信息" << endl;
        cout << "4. 查询最短路线" << endl;
        cout << "5. 返回主菜单" << endl;
        cout << "请输入你的选择: ";

        cin >> choice;

        switch (choice)
        {
        case 1:
            showAllSpots(spots);
            break;

        case 2:
            querySpot(spots);
            break;

        case 3:
        {
            int a, b;

            cout << "请输入起点ID: ";
            cin >> a;

            cout << "请输入终点ID: ";
            cin >> b;

            queryRoad(a, b, spots);

            break;
        }

        case 4:
        {
            string startName;
            string endName;

            cout << "请输入起点名称: ";
            cin >> startName;

            cout << "请输入终点名称: ";
            cin >> endName;

            int start = findSpotID(startName, spots);
            int end = findSpotID(endName, spots);

            if (start == -1 || end == -1)
            {
                cout << "地点不存在，请重新输入。" << endl;
            }
            else
            {
                dijkstra(start, end, spots);
            }

            break;
        }

        case 5:
            cout << "正在返回主菜单..." << endl;
            break;

        default:
            cout << "输入错误，请重新选择。" << endl;
            break;
        }
    }
}

void locationManagementMenu(vector<Spot>& spots)
{
    int choice = 0;

    while (choice != 4)
    {
        cout << endl;
        cout << "================================" << endl;
        cout << "          地点信息管理          " << endl;
        cout << "================================" << endl;
        cout << "1. 查看所有地点" << endl;
        cout << "2. 修改地点名称与介绍" << endl;
        cout << "3. 修改地点地图坐标" << endl;
        cout << "4. 返回管理员菜单" << endl;
        cout << "请输入你的选择：";

        cin >> choice;

        switch (choice)
        {
        case 1:
            showAllSpots(spots);
            break;

        case 2:
        {
            int id;
            string name;
            string description;

            cout << "请输入要修改的地点ID：";
            cin >> id;

            if (id < 0 || id >= spots.size())
            {
                cout << "地点ID输入错误。" << endl;
                break;
            }

            cout << "当前名称："
                 << spots[id].name
                 << endl;

            cout << "当前介绍："
                 << spots[id].description
                 << endl;

            cin.ignore(
                numeric_limits<streamsize>::max(),
                '\n'
            );

            cout << "请输入新的地点名称：";
            getline(cin, name);

            cout << "请输入新的地点介绍：";
            getline(cin, description);

            if (name.empty() || description.empty())
            {
                cout << "地点名称和介绍不能为空。" << endl;
                break;
            }

            spots[id].name = name;
            spots[id].description = description;

            if (saveSpots(spots))
            {
                cout << "地点名称和介绍修改成功。" << endl;
            }

            break;
        }

        case 3:
        {
            int id;
            int x;
            int y;

            cout << "请输入要修改坐标的地点ID：";
            cin >> id;

            if (id < 0 || id >= spots.size())
            {
                cout << "地点ID输入错误。" << endl;
                break;
            }

            cout << "当前坐标：("
                 << spots[id].x
                 << ", "
                 << spots[id].y
                 << ")"
                 << endl;

            cout << "请输入新的x坐标：";
            cin >> x;

            cout << "请输入新的y坐标：";
            cin >> y;

            if (x < 0 || y < 0)
            {
                cout << "地图坐标不能小于0。" << endl;
                break;
            }

            spots[id].x = x;
            spots[id].y = y;

            if (saveSpots(spots))
            {
                cout << "地点地图坐标修改成功。" << endl;
            }

            break;
        }

        case 4:
            cout << "正在返回管理员菜单..." << endl;
            break;

        default:
            cout << "输入错误，请重新选择。" << endl;
            break;
        }
    }
}

void roadManagementMenu(vector<Spot>& spots)
{
    int choice = 0;

    while (choice != 7)
    {
        cout << endl;
        cout << "================================" << endl;
        cout << "          道路信息管理          " << endl;
        cout << "================================" << endl;
        cout << "1. 查看所有道路" << endl;
        cout << "2. 增加道路" << endl;
        cout << "3. 修改道路距离" << endl;
        cout << "4. 临时关闭道路" << endl;
        cout << "5. 恢复道路" << endl;
        cout << "6. 查询指定道路" << endl;
        cout << "7. 返回管理员菜单" << endl;
        cout << "请输入你的选择：";

        cin >> choice;

        switch (choice)
        {
        case 1:
            showAllRoads(spots);
            break;

        case 2:
        {
            int a;
            int b;
            int distance;

            cout << "请输入道路起点ID：";
            cin >> a;

            cout << "请输入道路终点ID：";
            cin >> b;

            cout << "请输入道路距离：";
            cin >> distance;

            if (
                a < 0 ||
                a >= spots.size() ||
                b < 0 ||
                b >= spots.size()
            )
            {
                cout << "地点ID输入错误。" << endl;
            }
            else if (a == b)
            {
                cout << "道路起点和终点不能相同。" << endl;
            }
            else if (distance <= 0)
            {
                cout << "道路距离必须大于0。" << endl;
            }
            else if (graph[a][b] != INF)
            {
                cout << "这两个地点之间已经存在道路。" << endl;
                cout << "如需调整距离，请使用“修改道路距离”。"
                     << endl;
            }
            else
            {
                addRoad(a, b, distance);

                if (saveRoads())
                {
                    cout << "道路增加成功。" << endl;
                }
            }

            break;
        }

        case 3:
        {
            int a;
            int b;
            int distance;

            cout << "请输入道路起点ID：";
            cin >> a;

            cout << "请输入道路终点ID：";
            cin >> b;

            if (
                a < 0 ||
                a >= spots.size() ||
                b < 0 ||
                b >= spots.size()
            )
            {
                cout << "地点ID输入错误。" << endl;
                break;
            }

            if (graph[a][b] == INF)
            {
                cout << "这两个地点之间当前不存在道路。" << endl;
                break;
            }

            cout << "当前道路距离："
                 << graph[a][b]
                 << " 米"
                 << endl;

            cout << "请输入新的道路距离：";
            cin >> distance;

            if (distance <= 0)
            {
                cout << "道路距离必须大于0。" << endl;
                break;
            }

            updateRoad(a, b, distance);

            saveRoads();

            break;
        }

        case 4:
        {
            int a;
            int b;

            cout << "请输入要关闭道路的起点ID：";
            cin >> a;

            cout << "请输入要关闭道路的终点ID：";
            cin >> b;

            if (
                a < 0 ||
                a >= spots.size() ||
                b < 0 ||
                b >= spots.size()
            )
            {
                cout << "地点ID输入错误。" << endl;
            }
            else if (graph[a][b] == INF)
            {
                cout << "这两个地点之间当前没有可用道路。"
                     << endl;
            }
            else
            {
                closeRoad(a, b);
                saveRoads();

                if (!isGraphConnected(spots.size()))
                {
                    cout << "警告：关闭该道路后，地图已不完全连通！"
                         << endl;
                }
            }

            break;
        }

        case 5:
        {
            int a;
            int b;
            int distance;

            cout << "请输入恢复道路的起点ID：";
            cin >> a;

            cout << "请输入恢复道路的终点ID：";
            cin >> b;

            cout << "请输入恢复后的道路距离：";
            cin >> distance;

            if (
                a < 0 ||
                a >= spots.size() ||
                b < 0 ||
                b >= spots.size()
            )
            {
                cout << "地点ID输入错误。" << endl;
            }
            else if (a == b)
            {
                cout << "道路起点和终点不能相同。" << endl;
            }
            else if (distance <= 0)
            {
                cout << "道路距离必须大于0。" << endl;
            }
            else
            {
                restoreRoad(a, b, distance);
                saveRoads();
            }

            break;
        }

        case 6:
        {
            int a;
            int b;

            cout << "请输入道路起点ID：";
            cin >> a;

            cout << "请输入道路终点ID：";
            cin >> b;

            queryRoad(a, b, spots);

            break;
        }

        case 7:
            cout << "正在返回管理员菜单..." << endl;
            break;

        default:
            cout << "输入错误，请重新选择。" << endl;
            break;
        }
    }
}

void checkMapConnectivity(const vector<Spot>& spots)
{
    if (spots.empty())
    {
        cout << "当前没有地点数据，无法检查地图。"
             << endl;
        return;
    }

    bool connected = isGraphConnected(
        static_cast<int>(spots.size())
    );

    cout << endl;
    cout << "================================" << endl;
    cout << "          地图连通性检查        " << endl;
    cout << "================================" << endl;

    if (connected)
    {
        cout << "检查通过：当前校园地图完全连通。"
             << endl;

        cout << "所有 "
             << spots.size()
             << " 个地点均可通过道路互相到达。"
             << endl;
    }
    else
    {
        cout << "检查失败：当前校园地图不完全连通。"
             << endl;

        cout << "可能存在孤立地点或道路配置错误。"
             << endl;
    }
}

void adminMenu(vector<Spot>& spots)
{
    int choice = 0;

    while (choice != 5)
    {
        cout << endl;
        cout << "================================" << endl;
        cout << "          管理员管理中心        " << endl;
        cout << "================================" << endl;
        cout << "1. 地点信息管理" << endl;
        cout << "2. 道路信息管理" << endl;
        cout << "3. 地图连通性检查" << endl;
        cout << "4. 查看地图数据概况" << endl;
        cout << "5. 返回系统主菜单" << endl;
        cout << "请输入你的选择：";

        cin >> choice;

        switch (choice)
        {
        case 1:
            locationManagementMenu(spots);
            break;

        case 2:
            roadManagementMenu(spots);
            break;

        case 3:
            checkMapConnectivity(spots);
            break;

        case 4:
            showDataSummary(spots);
            break;

        case 5:
            cout << "正在退出管理员管理中心..."
                 << endl;
            break;

        default:
            cout << "输入错误，请重新选择。" << endl;
            break;
        }
    }
}


// 主菜单
void menu(vector<Spot>& spots)
{
    int choice = 0;

    while (choice != 3)
    {
        cout << endl;
        cout << "========================" << endl;
        cout << "      校园导览系统       " << endl;
        cout << "========================" << endl;
        cout << "1. 普通用户进入" << endl;
        cout << "2. 管理员登录" << endl;
        cout << "3. 退出系统" << endl;
        cout << "请输入你的选择: ";

        cin >> choice;

        switch (choice)
        {
        case 1:
            userMenu(spots);
            break;

        case 2:
            if (adminLogin())
            {
                adminMenu(spots);
            }
            break;

        case 3:
            cout << "感谢使用校园导览系统！" << endl;
            break;

        default:
            cout << "输入错误，请重新选择。" << endl;
            break;
        }
    }
}