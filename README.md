# k6 Demo Load Testing Project!
The suite consists of a different load test strategies,
1) Rest APIs
2) GraphQL
3) Web Sockets
4) Data Generation: faker API

## Running Performance tests 

You can run these tests either locally or in [Grafana Cloud](https://grafana.com/products/cloud/k6/)

k6 run -e DURATION=10m,15m,5m -e TARGET=1,1,0  .\scripts\rest-api\demo-rest-api\test.js

## Cloud Execution ##
1) k6 login cloud --token *******************
2) k6 cloud -e DURATION=10m,15m,5m -e TARGET=1,1,0 .\scripts\rest-api\demo-rest-api\test.js

## Execution through Github Actions ##
1) Login and Navigate to the repository.
2) To start a new workflow run, click the Actions tab in the repository.

   
### Test specific instructions

### Data Generation


