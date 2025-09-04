#!/usr/bin/env python3

import math

votes={
	"Hunter": [8,4,2,7,6,8,9,5,0],
	"Ivan": [3,3,1,7,6,0,3,9,3],
	"Churro": [6,9,3,3,2,5,3,5,7],
	"Marko": [9,6,9,9,0,1,5,6,3]
}

def distance(x, y):
	# math.pow(votes[x][i] - votes[y][i], 2)
	return 1 / (1 + math.dist(votes[x], votes[y]))

if __name__ == "__main__":
	for n in votes:
		if n == "Ivan": continue
		print(f"{n},{distance("Ivan", n)}")
