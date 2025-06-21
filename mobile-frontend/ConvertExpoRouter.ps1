# Script to convert expo-router to React Navigation
$directory = "src"  # Change this to the directory containing your components

# Function to process a file
function ProcessFile {
    param (
        [string]$filePath
    )
    
    Write-Host "Processing $filePath..."
    
    # Read the file content
    $content = Get-Content -Path $filePath -Raw
    
    # Skip if no expo-router references
    if (-not ($content -match "expo-router")) {
        return
    }
    
    # Replace imports
    $content = $content -replace "import\s*\{\s*([^}]*(?:useRouter|Link|Tabs|Stack|useLocalSearchParams)[^}]*)\s*\}\s*from\s*['""]expo-router['""]", "import { useNavigation, useRoute } from '@react-navigation/native';"
    
    # Replace router.push calls
    $content = $content -replace "router\.push\(['""]\/([^'""]+)['""]", "navigation.navigate('`$1'"
    $content = $content -replace "router\.push\(['""]([^\/][^'""]+)['""]", "navigation.navigate('`$1'"
    
    # Fix paths that might have parameters
    $content = $content -replace "navigation\.navigate\('([^']+)\/\[([^\]]+)\]", "navigation.navigate('`$1', { `$2: "
    
    # Replace router.back() calls
    $content = $content -replace "router\.back\(\)", "navigation.goBack()"
    
    # Replace useLocalSearchParams
    $content = $content -replace "const\s+\{([^}]+)\}\s*=\s*useLocalSearchParams", "const route = useRoute();"
    $content = $content -replace "useLocalSearchParams", "useRoute()"
    
    # Fix params access
    $content = $content -replace "const\s+\{\s*([^}:]+)\s*\}\s*=\s*route\.params", "const { `$1 } = route.params as { `$1: string }"
    
    # Add navigation declaration where router is used
    if ($content -match "router\." -and -not ($content -match "const\s+navigation\s*=\s*useNavigation\(\)")) {
        $content = $content -replace "(function\s+\w+\s*\([^)]*\)\s*\{)", "`$1`n  const navigation = useNavigation();"
    }
    
    # Replace router variable declarations
    $content = $content -replace "const\s+router\s*=\s*useRouter\(\)", "const navigation = useNavigation()"
    
    # Fix any remaining router references
    $content = $content -replace "router\.", "navigation."
    
    # Write the modified content back to the file
    Set-Content -Path $filePath -Value $content
    
    Write-Host "Updated $filePath"
}

# Get all TypeScript and JavaScript files
$files = Get-ChildItem -Path $directory -Include "*.tsx","*.ts","*.jsx","*.js" -Recurse

# Process each file
foreach ($file in $files) {
    ProcessFile -filePath $file.FullName
}

Write-Host "Conversion complete. You may need to manually check some files for edge cases."