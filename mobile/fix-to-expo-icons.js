// fix-to-expo-icons.js - Convert Lucide to Expo Vector Icons

const fs = require('fs');
const path = require('path');

// Icon mapping from Lucide to Expo Vector Icons
const iconReplacements = {
  // Your specific icons
  'MessagesSquare': 'MaterialIcons name="chat-bubble-outline"',
  'Users': 'MaterialIcons name="group"',
  'UserIcon': 'MaterialIcons name="person"',
  
  // Common icons
  'Check': 'MaterialIcons name="check"',
  'X': 'MaterialIcons name="close"',
  'Loader2': 'MaterialIcons name="refresh"',
  'Settings': 'MaterialIcons name="settings"',
  'ExternalLink': 'MaterialIcons name="open-in-new"',
  'Lock': 'MaterialIcons name="lock"',
  'Camera': 'MaterialIcons name="camera-alt"',
  'Save': 'MaterialIcons name="save"',
  'AlertCircle': 'MaterialIcons name="error-outline"',
  
  // User related
  'UserPlus': 'MaterialIcons name="person-add"',
  'UserCheck': 'MaterialIcons name="person-pin"',
  'UserX': 'MaterialIcons name="person-off"',
  'UserCog': 'MaterialIcons name="manage-accounts"',
  
  // Theme icons
  'Moon': 'MaterialIcons name="dark-mode"',
  'Sun': 'MaterialIcons name="light-mode"',
  
  // Other
  'LogOut': 'MaterialIcons name="logout"',
  'HelpCircle': 'MaterialIcons name="help-outline"',
  'Shield': 'MaterialIcons name="security"',
  'Eye': 'MaterialIcons name="visibility"',
  'Bell': 'MaterialIcons name="notifications"',
  'Heart': 'MaterialIcons name="favorite-border"',
  'MessageSquare': 'MaterialIcons name="chat-bubble-outline"',
  'Share': 'MaterialIcons name="share"',
  'Bookmark': 'MaterialIcons name="bookmark-border"',
  
  // Arrow icons
  'ChevronRight': 'MaterialIcons name="chevron-right"',
  'ChevronLeft': 'MaterialIcons name="chevron-left"',
  'ChevronUp': 'MaterialIcons name="expand-less"',
  'ChevronDown': 'MaterialIcons name="expand-more"',
};

// Function to process a file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace Lucide imports with Expo Vector Icons imports
  const lucideImportRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]lucide-react(?:-native)?['"];/g;
  const lucideImports = content.match(lucideImportRegex);
  
  if (lucideImports) {
    // Replace the import
    content = content.replace(lucideImportRegex, '');
    
    // Add MaterialIcons import if not already present
    if (!content.includes('MaterialIcons')) {
      content = `import { MaterialIcons } from '@expo/vector-icons';\n` + content;
    }
    modified = true;
  }

  // Replace icon usage
  Object.entries(iconReplacements).forEach(([lucideIcon, expoIcon]) => {
    // Replace icon with color prop
    const iconRegex = new RegExp(`<${lucideIcon}\\s+size={([^}]+)}\\s+color="([^"]+)"\\s*/>`, 'g');
    const newContent = content.replace(iconRegex, `<${expoIcon} size={$1} color="$2" />`);
    
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
    
    // Replace icon with className (legacy)
    const classNameRegex = new RegExp(`<${lucideIcon}\\s+size={([^}]+)}\\s+className="[^"]*"\\s*/>`, 'g');
    const newClassNameContent = content.replace(classNameRegex, `<${expoIcon} size={$1} color="#6b7280" />`);
    
    if (newClassNameContent !== content) {
      content = newClassNameContent;
      modified = true;
    }
  });

  // Write the file back
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  }
}

// Function to find all TypeScript/TSX files
function findFiles(dir, extension) {
  const files = fs.readdirSync(dir);
  let results = [];

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && file !== 'node_modules') {
      results = results.concat(findFiles(filePath, extension));
    } else if (file.endsWith(extension)) {
      results.push(filePath);
    }
  });

  return results;
}

// Main execution
console.log('🔍 Finding files...');
const files = [...findFiles('src', '.tsx'), ...findFiles('src', '.ts')];

console.log(`📝 Processing ${files.length} files...`);
files.forEach(processFile);

console.log('✨ Done! Converted all Lucide icons to Expo Vector Icons');
console.log('\n📌 Next steps:');
console.log('1. Make sure to import MaterialIcons in files that use icons');
console.log('2. Update any remaining icon references manually');
console.log('3. Test your app to ensure all icons are working correctly');