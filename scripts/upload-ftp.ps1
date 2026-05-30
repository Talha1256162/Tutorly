param(
    [Parameter(Mandatory = $true)]
    [string]$FtpServer,
    [Parameter(Mandatory = $true)]
    [string]$FtpUser,
    [Parameter(Mandatory = $true)]
    [string]$FtpPassword,
    [Parameter(Mandatory = $true)]
    [string]$LocalPath,
    [string]$RemotePath = 'wwwroot'
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

New-FtpDirectory $RemotePath
Remove-FtpFileIfExists "$RemotePath/iisstart.htm"

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
    Send-FtpFile $file.FullName "$RemotePath/$relative"
    $uploaded++
    if (($uploaded % 20) -eq 0 -or $uploaded -eq $files.Count) {
        Write-Host "Uploaded $uploaded / $($files.Count) files..."
    }
}

Write-Host "Uploaded $uploaded files to ftp://$FtpServer/$RemotePath/"
