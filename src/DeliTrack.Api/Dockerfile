FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["DeliTrack.Api.csproj", "./"]
RUN dotnet restore "DeliTrack.Api.csproj"
COPY . .
RUN dotnet publish "DeliTrack.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "DeliTrack.Api.dll"]
