docker-compose -f "docker-compose.debug.yml" up
pause

#docker run --rm -it -p 10000:80 -p 7000:443 -e DOTNET_URLS=https://+:80 -e "ASPNETCORE_URLS=https://+:443;http://+:80" -e ASPNETCORE_HTTPS_PORT=7000 -e ASPNETCORE_Kestrel__Certificates__Default__Password="password" -e Logging__Loglevel__Microsoft.AspNetCore=Debug -e ASPNETCORE_Kestrel__Certificates__Default__Path=/https/aspnetapp.pfx -v /c/Users/Katuta/%USERPROFILE%/.aspnet/https:/https/ results-net:1.0.3
#pause