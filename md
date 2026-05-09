PS D:\aethelon> k6 run tests/performance/load-test.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 

     execution: local
        script: tests/performance/load-test.js
        output: -

     scenarios: (100.00%) 3 scenarios, 100 max VUs, 2m15s max duration (incl. graceful stop):
              * browsing: Up to 70 looping VUs for 1m45s over 3 stages (gracefulRampDown: 30s, exec: browsingFlow, gracefulStop: 30s)
              * checkout: Up to 10 looping VUs for 1m45s over 3 stages (gracefulRampDown: 30s, exec: checkoutFlow, gracefulStop: 30s)
              * filtering: Up to 20 looping VUs for 1m45s over 3 stages (gracefulRampDown: 30s, exec: filteringFlow, gracefulStop: 30s)



  █ THRESHOLDS

    http_req_duration{type:browsing}
    ✓ 'p(95)<500' p(95)=297.37ms

    http_req_duration{type:checkout}
    ✓ 'p(95)<1500' p(95)=305.1ms

    http_req_duration{type:filtering}
    ✓ 'p(95)<1000' p(95)=323.93ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%


  █ TOTAL RESULTS

    checks_total.......: 3164    27.903269/s
    checks_succeeded...: 100.00% 3164 out of 3164     
    checks_failed......: 0.00%   0 out of 3164        

    ✓ Home 200
    ✓ Filter 200
    ✓ Shop 200
    ✓ About 200
    ✓ Bag 200

    HTTP
    http_req_duration..............: avg=135.67ms min=4.16ms   med=18.65ms  max=980.05ms p(90)=291.27ms p(95)=301.92ms
      { expected_response:true }...: avg=135.67ms min=4.16ms   med=18.65ms  max=980.05ms p(90)=291.27ms p(95)=301.92ms
      { type:browsing }............: avg=103.55ms min=4.16ms   med=12.57ms  max=879.39ms p(90)=288.13ms p(95)=297.37ms
      { type:checkout }............: avg=151.53ms min=4.32ms   med=167.97ms max=547.69ms p(90)=294.34ms p(95)=305.1ms
      { type:filtering }...........: avg=292.03ms min=252.73ms med=281.9ms  max=980.05ms p(90)=306.83ms p(95)=323.93ms
    http_req_failed................: 0.00%  0 out of 3164
    http_reqs......................: 3164   27.903269/s

    EXECUTION
    iteration_duration.............: avg=6.06s    min=2.27s    med=6.13s    max=11.03s   p(90)=8.96s    p(95)=9.5s
    iterations.....................: 1413   12.461226/s
    vus............................: 1      min=1     
    max=100
    vus_max........................: 100    min=100   
    max=100

    NETWORK
    data_received..................: 219 MB 1.9 MB/s  