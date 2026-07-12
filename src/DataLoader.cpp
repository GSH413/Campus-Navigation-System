#include "../include/DataLoader.h"
#include "../include/Graph.h"
#include <fstream>
#include <iostream>
#include <sstream>

using namespace std;


bool loadSpots(vector<Spot>& spots)
{
    ifstream file("assets/spots.txt");

    if (!file.is_open())
    {
        cout << "地点文件打开失败。" << endl;
        return false;
    }

    spots.clear();

    string line;

    while (getline(file, line))
    {
        stringstream ss(line);

        string idStr;
        string name;
        string description;
        string xStr;
        string yStr;

        getline(ss, idStr, '|');
        getline(ss, name, '|');
        getline(ss, description, '|');
        getline(ss, xStr, '|');
        getline(ss, yStr, '|');

        Spot spot;
        spot.id = stoi(idStr);
        spot.name = name;
        spot.description = description;
        spot.x = stoi(xStr);
        spot.y = stoi(yStr);

        spots.push_back(spot);
    }

    cout << "地点数据读取成功，共读取 "
         << spots.size()
         << " 个地点。"
         << endl;

    return true;
}

bool loadRoads()// 从文件加载道路信息
{
    ifstream file("assets/roads.txt");

    if (!file.is_open())
    {
        cout << "道路文件打开失败。" << endl;
        return false;
    }

    int a;
    int b;
    int distance;

    while (file >> a >> b >> distance)
    {
        addRoad(a, b, distance);
    }

    cout << "道路数据读取成功。" << endl;

    return true;
}

bool saveRoads()
{
    ofstream file("assets/roads.txt");

    if (!file.is_open())
    {
        cout << "道路文件保存失败。" << endl;
        return false;
    }

    for (int i = 0; i < MAXN; i++)
    {
        for (int j = i + 1; j < MAXN; j++)
        {
            if (graph[i][j] != INF && graph[i][j] != 0)
            {
                file << i << " "
                     << j << " "
                     << graph[i][j]
                     << endl;
            }
        }
    }

    cout << "道路数据已保存到文件。" << endl;

    return true;
}

bool saveSpots(const vector<Spot>& spots)
{
    ofstream file("assets/spots.txt");

    if (!file.is_open())
    {
        cout << "地点文件保存失败。" << endl;
        return false;
    }

    for (const auto& spot : spots)
    {
        file << spot.id << "|"
             << spot.name << "|"
             << spot.description << "|"
             << spot.x << "|"
             << spot.y
             << endl;
    }

    cout << "地点数据已保存到文件。" << endl;

    return true;
}