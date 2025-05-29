# Create a simple HTTP server using PowerShell
$Hso = New-Object Net.HttpListener
$Hso.Prefixes.Add("http://localhost:8080/")
$Hso.Start()

Write-Host "Server started at http://localhost:8080/"
Write-Host "Press Ctrl+C to stop the server"

$webRoot = $PSScriptRoot

try {
    while ($Hso.IsListening) {
        $HC = $Hso.GetContext()
        $HRes = $HC.Response
        
        $requestedFile = $HC.Request.RawUrl
        $requestedFile = $requestedFile.Replace("/", "\")
        if ($requestedFile -eq "\") { $requestedFile = "\index.html" }
        
        $physicalPath = $webRoot + $requestedFile
        
        if (Test-Path $physicalPath) {
            $contentType = "text/html"
            if ($physicalPath -match "\.js$") { $contentType = "application/javascript" }
            if ($physicalPath -match "\.css$") { $contentType = "text/css" }
            if ($physicalPath -match "\.(jpg|jpeg|png|gif)$") { $contentType = "image/" + $matches[1] }
            
            $content = [System.IO.File]::ReadAllBytes($physicalPath)
            $HRes.ContentType = $contentType
            $HRes.ContentLength64 = $content.Length
            $HRes.OutputStream.Write($content, 0, $content.Length)
        }
        else {
            $HRes.StatusCode = 404
        }
        
        $HRes.Close()
    }
}
finally {
    $Hso.Stop()
}
