CXX = g++
CXXFLAGS = -std=c++17 -Iinclude

SRC = src/main.cpp \
      src/Spot.cpp \
      src/Graph.cpp \
      src/Dijkstra.cpp \
      src/Menu.cpp \
      src/DataLoader.cpp

TARGET = campus

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) $(SRC) -o $(TARGET)

clean:
	rm -f $(TARGET)