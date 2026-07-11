#ifndef SPOT_H
#define SPOT_H

#include <string>
#include <vector>

using namespace std;


struct Spot {

    int id;

    string name;

    string description;

    int x;

    int y;

};


void showAllSpots(const vector<Spot>& spots);

int findSpotID(string name,const vector<Spot>& spots);


#endif