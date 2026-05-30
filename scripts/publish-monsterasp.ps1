param(
    [string]$SqlServer = $env:MENTORA_SQL_SERVER,
    [string]$Database = $env:MENTORA_SQL_DATABASE,
    [string]$SqlUser = $(if ($env:MENTORA_SQL_USER) { $env:MENTORA_SQL_USER } else { 'db54108' }),
    [string]$SqlPassword = $env:MENTORA_SQL_PASSWORD,
    [string]$SqlEncrypt = $(if ($env:MENTORA_SQL_ENCRYPT) { $env:MENTORA_SQL_ENCRYPT } else { 'False' }),
    [string]$WebsiteOrigin = 'http://mentora.tryasp.net',
    [string]$JwtSigningKey = $env:MENTORA_JWT_SIGNING_KEY,
    [switch]$SkipInstall,
    [switch]$AllowMissingDatabaseConfig
)

$ErrorActionPreference = 'Stop'

$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$frontend = Join-Path $root 'frontend\tutorlypk-web'
$backendProject = Join-Path $root 'backend\Tutorly.Api\Tutorly.Api.csproj'
$artifacts = [System.IO.Path]::GetFullPath((Join-Path $root 'artifacts'))
$publishDir = [System.IO.Path]::GetFullPath((Join-Path $artifacts 'monsterasp'))
$zipPath = Join-Path $artifacts 'mentora-monsterasp.zip'
$databaseBundlePath = Join-Path $artifacts 'mentora-database.sql'

if (-not $publishDir.StartsWith($artifacts, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Publish directory must stay inside $artifacts."
}

$machinePath = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
$userPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
$env:Path = "$machinePath;$userPath"

New-Item -ItemType Directory -Force -Path $artifacts | Out-Null

if (-not $SkipInstall -and -not (Test-Path (Join-Path $frontend 'node_modules'))) {
    npm.cmd --prefix $frontend ci
}

npm.cmd --prefix $frontend run build

if (Test-Path $publishDir) {
    Remove-Item -LiteralPath $publishDir -Recurse -Force
}

dotnet publish $backendProject -c Release -o $publishDir --no-self-contained

$frontendDistCandidates = @(
    (Join-Path $frontend 'dist\tutorlypk-web\browser'),
    (Join-Path $frontend 'dist\tutorlypk-web')
)
$frontendDist = $frontendDistCandidates |
    Where-Object { Test-Path (Join-Path $_ 'index.html') } |
    Select-Object -First 1

if (-not $frontendDist) {
    throw 'Angular build output was not found.'
}

$wwwroot = Join-Path $publishDir 'wwwroot'
if (Test-Path $wwwroot) {
    Remove-Item -LiteralPath $wwwroot -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $wwwroot | Out-Null
Copy-Item -Path (Join-Path $frontendDist '*') -Destination $wwwroot -Recurse -Force

if ([string]::IsNullOrWhiteSpace($JwtSigningKey)) {
    $bytes = New-Object byte[] 64
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($bytes)
    } finally {
        $rng.Dispose()
    }
    $JwtSigningKey = [Convert]::ToBase64String($bytes)
}

$runtimeConfig = [ordered]@{
    Jwt = [ordered]@{
        Issuer = 'Tutorly'
        Audience = 'Tutorly.Web'
        SigningKey = $JwtSigningKey
        AccessTokenMinutes = 30
        RefreshTokenDays = 14
    }
    Swagger = [ordered]@{
        Enabled = $false
    }
    HttpsRedirection = [ordered]@{
        Enabled = $false
    }
    Cors = [ordered]@{
        AllowedOrigins = @(
            $WebsiteOrigin,
            ($WebsiteOrigin -replace '^http:', 'https:'),
            'http://localhost:4200',
            'http://127.0.0.1:4200'
        ) | Select-Object -Unique
    }
}

$hasDatabaseConfig = -not [string]::IsNullOrWhiteSpace($SqlServer) `
    -and -not [string]::IsNullOrWhiteSpace($Database) `
    -and -not [string]::IsNullOrWhiteSpace($SqlUser) `
    -and -not [string]::IsNullOrWhiteSpace($SqlPassword)

if ($hasDatabaseConfig) {
    $serverWithPort = if ($SqlServer -match ',\d+$') { $SqlServer } else { "$SqlServer,1433" }
    $runtimeConfig.ConnectionStrings = [ordered]@{
        TutorlyDb = "Server=$serverWithPort;Database=$Database;User Id=$SqlUser;Password=$SqlPassword;Encrypt=$SqlEncrypt;TrustServerCertificate=True;MultipleActiveResultSets=True;Connect Timeout=60"
    }
} elseif (-not $AllowMissingDatabaseConfig) {
    throw 'Database config is incomplete. Pass -SqlServer, -Database, -SqlUser, and -SqlPassword or set MENTORA_SQL_* environment variables.'
} else {
    Write-Warning 'Database config was not written because host/database/password are incomplete.'
}

$runtimeConfig |
    ConvertTo-Json -Depth 8 |
    Set-Content -Path (Join-Path $publishDir 'appsettings.Production.json') -Encoding utf8

$databaseFiles = @(
    (Join-Path $root 'database\schema.sql'),
    (Join-Path $root 'database\seed.sql')
) + (Get-ChildItem (Join-Path $root 'database\migrations') -Filter '*.sql' | Sort-Object Name | Select-Object -ExpandProperty FullName)

Set-Content -Path $databaseBundlePath -Value "set nocount on;`r`nset xact_abort on;`r`n" -Encoding utf8
foreach ($databaseFile in $databaseFiles) {
    $relativePath = $databaseFile.Substring($root.Length + 1)
    Add-Content -Path $databaseBundlePath -Value "`r`nprint 'Running $relativePath';`r`ngo`r`n" -Encoding utf8
    Add-Content -Path $databaseBundlePath -Value (Get-Content -Raw -Path $databaseFile) -Encoding utf8
    Add-Content -Path $databaseBundlePath -Value "`r`ngo`r`n" -Encoding utf8
}

if (Test-Path $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -Path (Join-Path $publishDir '*') -DestinationPath $zipPath -Force

Write-Host "Publish folder: $publishDir"
Write-Host "Website ZIP: $zipPath"
Write-Host "Database SQL bundle: $databaseBundlePath"
