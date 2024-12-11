````
npm install
````

````
node db/setup.js
````

````
curl -X GET http://localhost:3000/apis \
-H "x-username: zwitty" \
-H "Content-Type: application/json"
````
````[{"id":3,"name":"Weather Zobi API","description":"Provides weather data"}]````

````
curl -X GET http://localhost:3000/apis \
-H "x-username: coucou" \
-H "Content-Type: application/json"
````
````{"error":"User not found"}   ````

````
curl -X PUT http://localhost:3000/apis/1 \
-H "x-username: zwitty" \
-H "Content-Type: application/json" \
-d '{
  "name": "The Fking GOOD API",
  "description": "Updated description for the API"
}'
````
````
{"id":1,"name":"The Fking GOOD API","description":"Updated description for the API"}
````

````
curl -X PUT http://localhost:3000/apis/1 \
-H "x-username: cavy" \
-H "Content-Type: application/json" \
-d '{
  "name": "The Fking GOOD API",
  "description": "Updated description for the API"
}'
````

````
{"error":"Permission denied"}
````


````
curl -X GET http://localhost:3000/apis \
-H "x-username: quentin" \
-H "Content-Type: application/json"
````
````
{"error":"User not found"}
````

````
curl -X GET http://localhost:3000/apis \
-H "x-username: tarantino" \
-H "Content-Type: application/json"
````
````
[{"id":1,"name":"Weather Zobi API","description":"Provides weather data"}]
````
