#include <iostream>
#include <string>
#include <vector>
#include <stack>
using namespace std;
// 景点结构体
struct Spot {
    int id;
    string name;
    string description;
    int x;
    int y;
};

const int MAXN = 20;// 最大景点数量
const int INF =99999999;// 无穷大
int graph[MAXN][MAXN];// 邻接矩阵表示图，存储道路距离

// 初始化景点信息
void initSpots(vector<Spot>& spots) {
    spots.push_back({0,"大门","学校入口",0,0});
    spots.push_back({1,"图书馆","自习的地方",10,20});
    spots.push_back({2,"食堂","吃饭的地方",15,25});
    spots.push_back({3,"校医室","看病的地方",20,30});
    spots.push_back({4,"行政楼","处理行政事务的地方",25,35});
    spots.push_back({5,"春华堂","上课的地方",30,40});
    spots.push_back({6,"秋实堂","做实验的地方",35,45});
    spots.push_back({7,"如意坊","便利店和快递站所在地",40,50});
    spots.push_back({8,"春语园","医工学院住宿的地方",45,55});
    spots.push_back({9,"春晖园","xx学院住宿的地方",50,60});
    spots.push_back({10,"春霖园","xx学院住宿的地方",55,60});
    spots.push_back({11,"春草园","xx学院住宿的地方",60,65});
    spots.push_back({12,"春风园","xx学院住宿的地方",65,70});
    spots.push_back({13,"道康园","xx学院住宿的地方兼康复医学院",70,75});
    spots.push_back({14,"操场","锻炼身体的地方（室外）",75,80});
    spots.push_back({15,"体育馆","锻炼身体的地方（室内）",80,85});
    spots.push_back({16,"医工楼","生物医学工程学院所在地",85,90});
}
// 添加一条双向道路
void addRoad(int a, int b, int distance) {
    graph[a][b] = distance;
    graph[b][a] = distance;
}


// 初始化校园道路
void initGraph() {
    for (int i = 0; i < MAXN; i++) {
        for (int j = 0; j < MAXN; j++) {
            if (i == j) {
                graph[i][j] = 0; // 自己到自己的距离为0
            } else {
                graph[i][j] = INF; // 初始化为无穷大，表示没有道路
            }
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

// 显示所有景点信息
void showallspots(const vector<Spot>& spots) {
    for (const auto& spot : spots) {
        cout << "ID: " << spot.id 
        << ",  " << spot.name 
        << ",  " << spot.description 
        << endl;
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
void printPath(int end,const vector<int>& pre,const vector<Spot>& spots){
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
    vector<int> dist(MAXN, INF); // 存储从起点到各点的最短距离
    vector<bool> visited(MAXN, false); // 标记是否已访问
    vector<int> pre(MAXN, -1); // 存储最短路径的前驱节点
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

        for (int v = 0; v < MAXN; ++v) {// 遍历所有邻接节点
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


        switch(choice)
        {

        case 1:
            showallspots(spots);
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
            int start,end;

            cout << "请输入起点ID:";
            cin >> start;

            cout << "请输入终点ID:";
            cin >> end;


            dijkstra(start,end,spots);

            break;
        }


        case 5:
            cout << "感谢使用校园导览系统！" << endl;
            break;


        default:
            cout << "输入错误，请重新选择。" << endl;

        }

    }

}
// 主函数
int main()
{
    vector<Spot> spots;// 存储景点信息的向量

    initSpots(spots);// 初始化景点信息

    initGraph();// 初始化校园道路

    menu(spots);// 显示菜单并处理用户输入

    return 0;
}
