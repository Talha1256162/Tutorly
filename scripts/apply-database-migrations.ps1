param(
    [string]$SqlServer = $env:MENTORA_SQL_SERVER,
    [string]$Database = $env:MENTORA_SQL_DATABASE,
    [string]$SqlUser = $(if ($env:MENTORA_SQL_USER) { $env:MENTORA_SQL_USER } else { 'db54108' }),
    [string]$SqlPassword = $env:MENTORA_SQL_PASSWORD,
    [string]$SqlEncrypt = $(if ($env:MENTORA_SQL_ENCRYPT) { $env:MENTORA_SQL_ENCRYPT } else { 'False' }),
    [string]$MigrationsPath = $(Join-Path $PSScriptRoot '..\database\migrations')
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($SqlServer) `
        -or [string]::IsNullOrWhiteSpace($Database) `
        -or [string]::IsNullOrWhiteSpace($SqlUser) `
        -or [string]::IsNullOrWhiteSpace($SqlPassword)) {
    throw 'Database config is incomplete. Pass -SqlServer, -Database, -SqlUser, and -SqlPassword or set MENTORA_SQL_* environment variables.'
}

$migrationsRoot = [System.IO.Path]::GetFullPath($MigrationsPath)
if (-not (Test-Path $migrationsRoot)) {
    throw "Migrations path not found: $migrationsRoot"
}

$sqlcmd = Get-Command sqlcmd -ErrorAction Stop
$serverWithPort = if ($SqlServer -match ',\d+$') { $SqlServer } else { "$SqlServer,1433" }
$baseArgs = @(
    '-S', $serverWithPort,
    '-d', $Database,
    '-U', $SqlUser,
    '-P', $SqlPassword,
    '-b',
    '-I',
    '-l', '60',
    '-t', '180'
)

function Invoke-DatabaseQuery([string]$query) {
    $output = & $sqlcmd.Source @baseArgs '-h' '-1' '-W' '-Q' $query 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw ($output -join [Environment]::NewLine)
    }

    return $output
}

function Invoke-DatabaseFile([string]$filePath) {
    $output = & $sqlcmd.Source @baseArgs '-i' $filePath 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw ($output -join [Environment]::NewLine)
    }

    return $output
}

$historySql = @"
if object_id(N'dbo.schemaMigrations', N'U') is null
begin
    create table dbo.schemaMigrations
    (
        MigrationName nvarchar(260) not null constraint PK_schemaMigrations primary key,
        AppliedAtUtc datetime2 not null constraint DF_schemaMigrations_AppliedAtUtc default sysutcdatetime()
    );
end
"@

Invoke-DatabaseQuery $historySql | Out-Null

$migrations = Get-ChildItem -LiteralPath $migrationsRoot -Filter '*.sql' -File | Sort-Object Name
foreach ($migration in $migrations) {
    $migrationName = $migration.Name.Replace("'", "''")
    $applied = Invoke-DatabaseQuery "set nocount on; if exists (select 1 from dbo.schemaMigrations where MigrationName = N'$migrationName') select 1 else select 0;"

    if (($applied -join '').Trim() -eq '1') {
        Write-Host "Skipping $($migration.Name) (already applied)"
        continue
    }

    Write-Host "Applying $($migration.Name)"
    Invoke-DatabaseFile $migration.FullName | Out-Null
    Invoke-DatabaseQuery "insert into dbo.schemaMigrations (MigrationName) select N'$migrationName' where not exists (select 1 from dbo.schemaMigrations where MigrationName = N'$migrationName');" | Out-Null
}

Write-Host "Database migrations are up to date."
