curl "http://127.0.0.1:8080/tgsolbot/transfer?uid=1&token=32Lpfsx4vwfsuGQR4WWKq77HeYvZzkj2kk8Mkim4TZGj&to=5pWae6RxD3zrYzBmPTMYo1LZ5vef3vfWH6iV3s8n6ZRG&ui&amount=1"
curl "http://127.0.0.1:8080/tgsolbot/transfer?uid=1&token=32Lpfsx4vwfsuGQR4WWKq77HeYvZzkj2kk8Mkim4TZGj&to=CZmVK1DymrSVWHiQCGXx6VG5zgHVrh5J1P514jHKRDxA&ui&amount=1"


curl "http://127.0.0.1:8080/tgsolbot/balance?uid=1&token=32Lpfsx4vwfsuGQR4WWKq77HeYvZzkj2kk8Mkim4TZGj"

curl "http://127.0.0.1:18081/tgsolbot/balance?uid=1"

curl "http://127.0.0.1:8080/tgsolbot/swap?uid=1&a_mint=BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k&b_mint=H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm&amount_in=1"

curl "http://127.0.0.1:18081/tgsolbot/balance?uid=1


curl -X POST http://43.156.120.3/tgsolbot/user -H 'Content-Type: application/json' -d '{"uid":5174599840}'

curl "http://43.156.120.3/tgsolbot/balance?uid=1&token=32Lpfsx4vwfsuGQR4WWKq77HeYvZzkj2kk8Mkim4TZGj"
curl "http://43.156.120.3/tgsolbot/balance?uid=1"
curl "http://43.156.120.3/tgsolbot/balance?uid=1&token=So11111111111111111111111111111111111111112"


curl "http://43.156.120.3/tgsolbot/balance?uid=5174599840"
curl "http://43.156.120.3/tgsolbot/balance?uid=808279791"

curl "http://43.156.120.3/tgsolbot/transfer" -H 'Content-Type: application/json' -d '{"uid":1,"amount":100000,"to":"54oiHCdkPUDScqDxyV1enzs81RpiheSD9TqDw2APNKcW"}'

curl "http://43.156.120.3/tgsolbot/swap" -H 'Content-Type: application/json' -d '{"uid":1,"amount_in":100000,"a_mint":"So11111111111111111111111111111111111111112","b_mint":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"}'

curl "http://43.156.120.3/tgsolbot/wrapsol" -H 'Content-Type: application/json' -d '{"uid":1,"amount_in":100000}'
curl "http://43.156.120.3/tgsolbot/wrapsol" -H 'Content-Type: application/json' -d '{"uid":1,"amount_in":100000}'
curl "http://43.156.120.3/tgsolbot/unwrapsol" -H 'Content-Type: application/json' -d '{"uid":1}'


curl "http://43.156.120.3/tgsolbot/transfer" -H 'Content-Type: application/json' -d '{"uid"5174599840,"amount":10000,"to":"So11111111111111111111111111111111111111112"}'

curl "http://43.156.120.3/tgsolbot/transfer" -H 'Content-Type: application/json' -d '{"uid":5174599840,"amount":10000,"to":"B1nJq2eQ7K44cUXu9VHh9GiEpJWvHwhYZm4WCGae1LXX","token":"So11111111111111111111111111111111111111112"}'

curl "http://43.156.120.3/tgsolbot/transfer" -H 'Content-Type: application/json' -d '{"uid":5174599840,"amount":100,"to":"B1nJq2eQ7K44cUXu9VHh9GiEpJWvHwhYZm4WCGae1LXX","token":"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"}'



curl "http://43.156.120.3/tgsolbot/swap" -H 'Content-Type: application/json' -d '{"uid":1,"amount_in":100000,"a_mint":"So11111111111111111111111111111111111111112","b_mint":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"}'


curl "http://43.156.120.3/tgsolbot/swap" -H 'Content-Type: application/json' -d '{"uid":1,"amount_in":1000,"a_mint":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v","b_mint":"So11111111111111111111111111111111111111112"}'

curl "http://43.156.120.3/tgsolbot/swap" -H 'Content-Type: application/json' -d '{"uid":1,"amount_in":10000,"a_mint":"So11111111111111111111111111111111111111112","b_mint":"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"}'

curl "http://43.156.120.3/tgsolbot/token?token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
curl "http://43.156.120.3/tgsolbot/token?token=So11111111111111111111111111111111111111112"
