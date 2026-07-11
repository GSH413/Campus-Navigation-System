#include "../include/Spot.h"
#include <iostream>

using namespace std;




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
