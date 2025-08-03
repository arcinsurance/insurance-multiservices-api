# Script PowerShell para corregir imports ES modules
Write-Host "🔧 Corrigiendo imports ES modules en archivos TypeScript..." -ForegroundColor Yellow

$files = Get-ChildItem -Path "src" -Filter "*.ts" -Recurse

foreach ($file in $files) {
    Write-Host "Corrigiendo: $($file.FullName)" -ForegroundColor Cyan
    
    $content = Get-Content $file.FullName -Raw
    
    # Corregir imports que empiecen con './' o '../'
    $content = $content -replace "from ['""](\.\./[^'""]*)['""]", "from '`$1.js'"
    $content = $content -replace "from ['""](\./[^'""]*)['""]", "from '`$1.js'"
    
    # Guardar el contenido corregido
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "✅ Corrección de imports completada" -ForegroundColor Green
