import requests
import json

url = "http://localhost:5000/predict_side_effects"

with open("test_data.json", "r") as f:
    data = json.load(f)

headers = {"Content-Type": "application/json"}

response = requests.post(url, headers=headers, data=json.dumps(data))

print(response.status_code)
print(response.json())
