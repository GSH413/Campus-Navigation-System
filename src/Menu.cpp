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


// 管理员菜单
void adminMenu(vector<Spot>& spots)
{
    int choice = 0;

    while (choice != 6)
    {
        cout << endl;
        cout << "========================" << endl;
        cout << "      管理员菜单         " << endl;
        cout << "========================" << endl;
        cout << "1. 修改道路距离" << endl;
        cout << "2. 关闭某条道路" << endl;
        cout << "3. 恢复某条道路" << endl;
        cout << "4. 修改地点信息" << endl;
        cout << "5. 增加道路" << endl;
        cout << "6. 返回主菜单" << endl;
        cout << "请输入你的选择: ";

        cin >> choice;

        switch (choice)
        {
        case 1:
        {
            int a, b, distance;

            cout << "请输入起点ID: ";
            cin >> a;

            cout << "请输入终点ID: ";
            cin >> b;

            cout << "请输入新的道路距离: ";
            cin >> distance;

            if (a < 0 || a >= spots.size() || b < 0 || b >= spots.size())
            {
                cout << "地点ID输入错误。" << endl;
            }
            else if (distance <= 0)
            {
                cout << "道路距离必须大于0。" << endl;
            }
            else
            {
                updateRoad(a, b, distance);
                saveRoads();
            }

            break;
        }

        case 2:
        {
            int a, b;

            cout << "请输入要关闭道路的起点ID: ";
            cin >> a;

            cout << "请输入要关闭道路的终点ID: ";
            cin >> b;

            if (a < 0 || a >= spots.size() || b < 0 || b >= spots.size())
            {
                cout << "地点ID输入错误。" << endl;
            }
            else
            {
                closeRoad(a, b);
                saveRoads();
            }

            break;
        }

        case 3:
        {
            int a, b, distance;

            cout << "请输入要恢复道路的起点ID: ";
            cin >> a;

            cout << "请输入要恢复道路的终点ID: ";
            cin >> b;

            cout << "请输入恢复后的道路距离: ";
            cin >> distance;

            if (a < 0 || a >= spots.size() || b < 0 || b >= spots.size())
            {
                cout << "地点ID输入错误。" << endl;
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

        case 4:
        {
            int id;
            string name;
            string description;
            int x;
            int y;

            cout << "请输入要修改的地点ID: ";
            cin >> id;

            if (id < 0 || id >= spots.size())
            {
                cout << "地点ID输入错误。" << endl;
                break;
            }

            cout << "当前地点信息：" << endl;
            cout << "名称: " << spots[id].name << endl;
            cout << "介绍: " << spots[id].description << endl;
            cout << "坐标: (" << spots[id].x << ", " << spots[id].y << ")" << endl;

            cout << "请输入新的地点名称: ";
            cin >> name;

            // 清理上一句 cin >> name 留下的换行符
            cin.ignore(numeric_limits<streamsize>::max(), '\n');

            cout << "请输入新的地点介绍: ";
            getline(cin, description);

            cout << "请输入新的x坐标: ";
            cin >> x;

            cout << "请输入新的y坐标: ";
            cin >> y;

            spots[id].name = name;
            spots[id].description = description;
            spots[id].x = x;
            spots[id].y = y;

            saveSpots(spots);

            cout << "地点信息修改成功。" << endl;

            break;
        }

        case 5:
        {
            int a, b, distance;

            cout << "请输入道路起点ID: ";
            cin >> a;

            cout << "请输入道路终点ID: ";
            cin >> b;

            cout << "请输入道路距离: ";
            cin >> distance;

            if (a < 0 || a >= spots.size() || b < 0 || b >= spots.size())
            {
                cout << "地点ID输入错误。" << endl;
            }
            else if (a == b)
            {
                cout << "起点和终点不能相同。" << endl;
            }
            else if (distance <= 0)
            {
                cout << "道路距离必须大于0。" << endl;
            }
            else
            {
                addRoad(a, b, distance);
                saveRoads();

                cout << "道路增加成功。" << endl;
            }

            break;
        }

        case 6:
            cout << "正在返回主菜单..." << endl;
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