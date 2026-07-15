#ifndef MENU_H
#define MENU_H

#include <vector>
#include "Spot.h"

using namespace std;


// 主菜单
void menu( vector<Spot>& spots);


// 普通用户菜单
void userMenu(const vector<Spot>& spots);


// 管理员菜单
void adminMenu(vector<Spot>& spots);


// 管理员登录
bool adminLogin();


// 查询地点信息
void querySpot(const vector<Spot>& spots);

void locationManagementMenu(vector<Spot>& spots);

void roadManagementMenu(vector<Spot>& spots);

void checkMapConnectivity(const vector<Spot>& spots);

#endif