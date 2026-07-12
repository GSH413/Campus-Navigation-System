#ifndef DATALOADER_H
#define DATALOADER_H

#include <vector>
#include "Spot.h"

using namespace std;


// 从文件读取地点信息
bool loadSpots(vector<Spot>& spots);

bool loadRoads();

bool saveRoads();

bool saveSpots(const vector<Spot>& spots);
#endif