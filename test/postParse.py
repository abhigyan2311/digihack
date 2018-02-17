import json
import requests
import time
from random import randint
import random
from datetime import datetime
from bson import json_util

def strTimeProp(start, end, format, prop):
    stime = time.mktime(time.strptime(start, format))
    etime = time.mktime(time.strptime(end, format))

    ptime = stime + prop * (etime - stime)

    return time.strftime(format, time.localtime(ptime))


def randomDate(start, end, prop):
    return strTimeProp(start, end, '%m/%d/%Y %I:%M %p', prop)

def updateParse(accNo,objectId):
	api_token = 'appKey231195'
	api_url_base = 'http://ec2-13-127-176-156.ap-south-1.compute.amazonaws.com:1337/parse/classes/'
	request = "Trans/"+objectId
	data = json.dumps({ "accountNo": str(accNo) })

	headers = {'Content-Type': 'application/json', 'X-Parse-Application-Id': api_token, 'X-Parse-REST-API-Key': 'restApi123'}

	response = requests.put(api_url_base+request, headers=headers, data=data)
	print(response.content)

def postParse(payeeId, accNo,category,amount):
	api_token = 'appKey231195'
	api_url_base = 'http://ec2-13-127-176-156.ap-south-1.compute.amazonaws.com:1337/parse/classes/'
	request = "Transaction/"
	data = json.dumps({ "mode": "upi", "payeeId": payeeId, "accountId" : accNo, "categoryId":category, "amount":amount, "transactionDate" : randomDate("1/1/2018 1:30 PM", "2/16/2018 4:50 AM", random.random()) }, default=json_util.default)

	headers = {'Content-Type': 'application/json', 'X-Parse-Application-Id': api_token, 'X-Parse-REST-API-Key': 'restApi123'}

	response = requests.post(api_url_base+request, headers=headers, data=data)
	print(response.content)

def getParse(table):
	api_token = 'appKey231195'
	api_url_base = 'http://ec2-13-127-176-156.ap-south-1.compute.amazonaws.com:1337/parse/classes/'
	request = table

	# query
	params = urllib.urlencode({"where":json.dumps({"playerName": "Sean Plott", "cheatMode": False })})

	headers = {'Content-Type': 'application/json', 'X-Parse-Application-Id': api_token, 'X-Parse-REST-API-Key': 'restApi123'}

	response = requests.get(api_url_base+request+"", headers=headers)
	print(response.content)
	return response.content

data1 = ['yv2kBmT8QE','RbpJ80aiFc']

data2 = getParse("Category")
t1 = json.loads(data2)
t3 = t1["results"]
t4 = []

# for i in range(100):
# 	merchant = randint(1,20)
# 	postParse(t3[merchant]['objectId'],data1[randint(0,1)],t3[merchant]['category'],randint(50,5000))

transactionsData = getParse("Transaction")["results"]

with open('dataHistory.csv', 'w', newline='') as csvfile:

