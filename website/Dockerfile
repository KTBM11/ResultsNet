FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build

RUN curl --silent --location https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install --yes nodejs

WORKDIR /src
COPY . .

RUN dotnet restore "ResultsNet.csproj"

RUN dotnet publish "ResultsNet.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:6.0

EXPOSE 7000
EXPOSE 10000

COPY --from=build /app/publish .

ENTRYPOINT [ "dotnet", "ResultsNet.dll" ]