# FileZilla Deployment Guide

## Project Structure to Upload

### Required Folders and Files:
```
logistic-1/
├── .next/                    # (Build output - DO NOT upload manually)
├── app/                      # ✅ Upload this folder
│   ├── (dashboard)/
│   ├── login/
│   ├── layout.tsx
│   ├── page.tsx
│   └── not-found.tsx
├── components/                # ✅ Upload this folder
│   ├── layout/
│   ├── shared/
│   ├── ui/
│   ├── theme-provider.tsx
│   └── ...
├── config/                   # ✅ Upload this folder
├── context/                  # ✅ Upload this folder
├── data/                     # ✅ Upload this folder
├── hooks/                    # ✅ Upload this folder
├── lib/                      # ✅ Upload this folder
├── public/                   # ✅ Upload this folder
│   ├── icon.svg
│   ├── icon-light-32x32.png
│   ├── icon-dark-32x32.png
│   ├── apple-icon.png
│   └── ...
├── services/                 # ✅ Upload this folder
├── styles/                   # ✅ Upload this folder
├── next.config.mjs           # ✅ Upload this file
├── package.json              # ✅ Upload this file
├── package-lock.json        # ✅ Upload this file
├── tsconfig.json            # ✅ Upload this file
├── postcss.config.mjs       # ✅ Upload this file
└── components.json          # ✅ Upload this file
```

## FileZilla Setup Commands

### 1. Build the Project First
```bash
# Navigate to project directory
cd /Users/np00sgw/Sgw_projects/logistic-1

# Install dependencies (if not already done)
npm install

# Build the production version
npm run build
```

### 2. FileZilla Connection Setup
```
Host: [Your hosting provider FTP address]
Username: [Your FTP username]
Password: [Your FTP password]
Port: 21 (standard) or 22 (SFTP)
Protocol: FTP or SFTP
```

### 3. Upload Commands via FileZilla

#### Method 1: Using FileZilla GUI
1. Connect to your server using the credentials above
2. Navigate to your web root directory (usually `/public_html` or `/www`)
3. Create a backup of existing files if needed
4. Upload the following folders and files:
   - `app/` folder
   - `components/` folder
   - `config/` folder
   - `context/` folder
   - `data/` folder
   - `hooks/` folder
   - `lib/` folder
   - `public/` folder
   - `services/` folder
   - `styles/` folder
   - `next.config.mjs`
   - `package.json`
   - `package-lock.json`
   - `tsconfig.json`
   - `postcss.config.mjs`
   - `components.json`

#### Method 2: Using Command Line (if you have SSH access)
```bash
# SSH into your server
ssh username@your-server.com

# Navigate to web directory
cd /public_html

# Create backup
tar -czf backup-$(date +%Y%m%d).tar.gz .

# Upload files using rsync (from local machine)
rsync -avz --exclude='.next' --exclude='node_modules' \
  /Users/np00sgw/Sgw_projects/logistic-1/ \
  username@your-server.com:/public_html/
```

### 4. Server-Side Commands (After Upload)

#### For Node.js Hosting:
```bash
# Navigate to project directory
cd /path/to/your/project

# Install dependencies on server
npm install --production

# Start the application
npm start
# or for production:
npm run start:prod
```

#### For Static Hosting (if using `next export`):
```bash
# Build static version
npm run build
npm run export

# Upload the `out/ folder contents to your web root
```

### 5. Environment Variables Setup
Create `.env` file on server with:
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com/api
DATABASE_URL=your-database-connection-string
JWT_SECRET=your-jwt-secret
```

## Important Notes

### ⚠️ DO NOT Upload:
- `node_modules/` (install on server)
- `.next/` (build on server)
- `.git/` (version control)
- `README.md` (documentation)

### ✅ MUST Upload:
- All source code folders
- Configuration files
- Public assets
- Package files

### 🔧 Post-Deployment Steps:
1. Set correct file permissions (`755` for folders, `644` for files)
2. Configure domain DNS if needed
3. Set up SSL certificate
4. Test all functionality
5. Monitor logs for errors

### 📁 Typical Server Directory Structure:
```
/home/username/
├── public_html/          # Web root
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── ...
├── logs/                # Application logs
└── tmp/                # Temporary files
```

## Troubleshooting

### Common Issues:
1. **500 Internal Server Error**: Check server logs
2. **Permission Denied**: Set correct file permissions
3. **Module Not Found**: Run `npm install` on server
4. **Build Failures**: Check Node.js version compatibility

### Log Locations:
- Apache: `/var/log/apache2/error.log`
- Nginx: `/var/log/nginx/error.log`
- Node.js: Check your process manager logs (PM2, systemd)

## Quick Upload Checklist

- [ ] Build project locally (`npm run build`)
- [ ] Backup existing server files
- [ ] Upload all required folders and files
- [ ] Set correct permissions
- [ ] Install dependencies on server
- [ ] Configure environment variables
- [ ] Start/restart application
- [ ] Test all functionality
- [ ] Monitor for errors
