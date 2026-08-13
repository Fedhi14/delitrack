FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/DeliTrack.Api/DeliTrack.Api.csproj", "DeliTrack.Api/"]
RUN dotnet restore "DeliTrack.Api/DeliTrack.Api.csproj"
COPY src/ .
WORKDIR "/src/DeliTrack.Api"
RUN dotnet publish "DeliTrack.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "DeliTrack.Api.dll"]
