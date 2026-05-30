param(
    [Parameter(Mandatory = $true)]
    [string]$FtpServer,
    [Parameter(Mandatory = $true)]
    [string]$FtpUser,
    [Parameter(Mandatory = $true)]
    [string]$FtpPassword,
    [Parameter(Mandatory = $true)]
    [string]$LocalPath,
    [string]$RemotePath = 'wwwroot',
    [switch]$AppOffline
)

$ErrorActionPreference = 'Stop'

$localRoot = [System.IO.Path]::GetFullPath($LocalPath)
if (-not (Test-Path $localRoot)) {
    throw "Local path not found: $localRoot"
}

$credentials = New-Object System.Net.NetworkCredential($FtpUser, $FtpPassword)
$localRootWithSeparator = if ($localRoot.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
    $localRoot
} else {
    "$localRoot$([System.IO.Path]::DirectorySeparatorChar)"
}

function Convert-ToFtpUri([string]$remotePath) {
    $cleanPath = $remotePath.TrimStart('/').Replace('\', '/')
    return "ftp://$FtpServer/$cleanPath"
}

function Invoke-FtpRequest([string]$remotePath, [string]$method) {
    $request = [System.Net.FtpWebRequest]::Create((Convert-ToFtpUri $remotePath))
    $request.Method = $method
    $request.Credentials = $credentials
    $request.UsePassive = $true
    $request.UseBinary = $true
    $request.KeepAlive = $false
    $request.Timeout = 60000
    $request.ReadWriteTimeout = 60000
    return $request
}

function New-FtpDirectory([string]$remotePath) {
    try {
        $request = Invoke-FtpRequest $remotePath ([System.Net.WebRequestMethods+Ftp]::MakeDirectory)
        $response = $request.GetResponse()
        $response.Dispose()
    } catch [System.Net.WebException] {
        $response = $_.Exception.Response
        if ($response) {
            $response.Dispose()
        }
    }
}

function Remove-FtpFileIfExists([string]$remotePath) {
    try {
        $request = Invoke-FtpRequest $remotePath ([System.Net.WebRequestMethods+Ftp]::DeleteFile)
        $response = $request.GetResponse()
        $response.Dispose()
    } catch [System.Net.WebException] {
        $response = $_.Exception.Response
        if ($response) {
            $response.Dispose()
        }
    }
}

function Send-FtpFile([string]$localFile, [string]$remoteFile) {
    $attempt = 0
    while ($true) {
        $attempt++
        try {
            $request = Invoke-FtpRequest $remoteFile ([System.Net.WebRequestMethods+Ftp]::UploadFile)
            $request.ContentLength = (Get-Item -LiteralPath $localFile).Length
            $stream = $request.GetRequestStream()
            $fileStream = [System.IO.File]::OpenRead($localFile)
            try {
                $fileStream.CopyTo($stream)
            } finally {
                $fileStream.Dispose()
                $stream.Dispose()
            }

            $response = $request.GetResponse()
            $response.Dispose()
            return
        } catch {
            if ($attempt -ge 4) {
                throw
            }

            Start-Sleep -Seconds (2 * $attempt)
        }
    }
}

$appOfflinePath = $null

try {
    New-FtpDirectory $RemotePath
    Remove-FtpFileIfExists "$RemotePath/iisstart.htm"

    if ($AppOffline) {
        $appOfflinePath = Join-Path ([System.IO.Path]::GetTempPath()) "app_offline_$([Guid]::NewGuid().ToString('N')).htm"
        Set-Content -Path $appOfflinePath -Value '<html><body><h1>Mentora is updating.</h1></body></html>' -Encoding utf8
        Send-FtpFile $appOfflinePath "$RemotePath/app_offline.htm"
        Start-Sleep -Seconds 8
    }

    $directories = Get-ChildItem -LiteralPath $localRoot -Recurse -Directory |
        Sort-Object { $_.FullName.Length }

    foreach ($directory in $directories) {
        $relative = $directory.FullName.Substring($localRootWithSeparator.Length).Replace('\', '/')
        New-FtpDirectory "$RemotePath/$relative"
    }

    $files = Get-ChildItem -LiteralPath $localRoot -Recurse -File
    $uploaded = 0
    foreach ($file in $files) {
        $relative = $file.FullName.Substring($localRootWithSeparator.Length).Replace('\', '/')
        Write-Host "Uploading $relative..."
        Send-FtpFile $file.FullName "$RemotePath/$relative"
        $uploaded++
        if (($uploaded % 20) -eq 0 -or $uploaded -eq $files.Count) {
            Write-Host "Uploaded $uploaded / $($files.Count) files..."
        }
    }

    Write-Host "Uploaded $uploaded files to ftp://$FtpServer/$RemotePath/"
} finally {
    if ($AppOffline) {
        Remove-FtpFileIfExists "$RemotePath/app_offline.htm"
    }

    if ($appOfflinePath -and (Test-Path $appOfflinePath)) {
        Remove-Item -LiteralPath $appOfflinePath -Force
    }
}
