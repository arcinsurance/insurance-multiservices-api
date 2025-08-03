#!/bin/bash
# Script para corregir imports ES modules en todos los archivos TypeScript

echo "🔧 Corrigiendo imports ES modules en archivos TypeScript..."

# Función para corregir imports en un archivo
fix_imports() {
    local file="$1"
    echo "Corrigiendo: $file"
    
    # Corregir imports locales (que empiecen con ./ o ../)
    sed -i "s|from '\(\.\./\)|\$|from '\1|g; s|\$\([^']*\)';|from '\1.js';|g" "$file"
    sed -i "s|from \"\(\.\./\)|\$|from \"\1|g; s|\$\([^\"]*\)\";|from \"\1.js\";|g" "$file"
    sed -i "s|from '\(\./\)|\$|from '\1|g; s|\$\([^']*\)';|from '\1.js';|g" "$file"
    sed -i "s|from \"\(\./\)|\$|from \"\1|g; s|\$\([^\"]*\)\";|from \"\1.js\";|g" "$file"
}

# Encontrar todos los archivos .ts en src/ y corregir imports
find src/ -name "*.ts" -type f | while read -r file; do
    fix_imports "$file"
done

echo "✅ Corrección de imports completada"
