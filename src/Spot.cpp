#include "../include/Spot.h"
#include <iostream>

using namespace std;


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


// 显示所有地点
void showAllSpots(const vector<Spot>& spots)
{

    for(const auto& spot : spots)
    {
        cout 
        << "ID:"
        << spot.id
        << " "
        << spot.name
        << " "
        << spot.description
        << endl;
    }

}


// 根据名字查找ID
int findSpotID(string name,const vector<Spot>& spots)
{

    for(int i=0;i<spots.size();i++)
    {

        if(spots[i].name == name)
        {
            return spots[i].id;
        }

    }


    return -1;

}
