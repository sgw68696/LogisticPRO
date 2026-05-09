#!/bin/bash

echo "🚀 Fast Deployment Script for Logistics App"
echo "=========================================="

# Step 1: Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out dist

# Step 2: Temporarily move problematic dynamic route
echo "📁 Temporarily moving dynamic route..."
mkdir -p temp_backup
if [ -d "app/(dashboard)/shipments/[id]" ]; then
    mv "app/(dashboard)/shipments/[id]" temp_backup/
fi

# Step 3: Build static version
echo "🔨 Building static version..."
NODE_ENV=production npx next build

# Step 4: Export static files
echo "📦 Exporting static files..."
npx next export

# Step 5: Restore dynamic route
echo "🔄 Restoring dynamic route..."
if [ -d "temp_backup/[id]" ]; then
    mv temp_backup/[id] "app/(dashboard)/shipments/[id]"
fi
rm -rf temp_backup

# Step 6: Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deploy
cp -r out/* deploy/
cp -r public deploy/public 2>/dev/null || true
cp package.json deploy/
cp next.config.mjs deploy/

# Step 7: Create ZIP for FileZilla
echo "🗜️ Creating ZIP file for FileZilla..."
cd deploy
zip -r ../logistics-static.zip .
cd ..

echo "✅ Build Complete!"
echo "📁 Static files ready in: out/"
echo "🗜️ ZIP file ready: logistics-static.zip"
echo ""
echo "📋 FileZilla Upload Instructions:"
echo "1. Connect to your server with FileZilla"
echo "2. Navigate to your web root (usually /public_html or /www)"
echo "3. Upload the contents of the 'out' folder"
echo "4. Alternatively, upload 'logistics-static.zip' and extract it"
echo ""
echo "🔗 Quick test locally:"
echo "npx serve out -p 3000"
echo ""
echo "📂 Folder structure to upload:"
ls -la out/
