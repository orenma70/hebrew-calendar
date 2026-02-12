# 1. הגדרות עצירה בשגיאה וניקוי המסך
$ErrorActionPreference = "Stop"
Clear-Host

Write-Host "`n=== 🚀 Firebase Automated Deploy ===" -ForegroundColor Cyan

# 2. וידוא פרויקט וקישור אוטומטי
Write-Host "Checking Firebase connection..." -ForegroundColor Yellow
$projectId = "all-you-need-64b1f"



if ($null -eq $projectId) {
    Write-Host "Error: Could not extract Project ID." -ForegroundColor Red
    Write-Host "firebase login --reauth"-ForegroundColor Red
    exit
}


Write-Host "Linked to Backend: $projectId" -ForegroundColor Gray
firebase use $projectId

# 3. ניקוי ובנייה מחדש (Fresh Build)
Write-Host "`nStep 1: Cleaning and Building..." -ForegroundColor Yellow
if (Test-Path ".\dist") { Remove-Item -Recurse -Force ".\dist" }
npm run build

if (-Not (Test-Path ".\dist")) {
    Write-Host "Error: Build failed!" -ForegroundColor Red
    exit
}

# 4. העלאה ל-Hosting
Write-Host "`nStep 2: Deploying to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting:calendar-site



# 5. חילוץ הכתובת ופתיחה בדפדפן
$siteUrl = "https://all-you-need-64b1f-616a2.web.app"
Write-Host "`n=== Success! Your app is live! 🚀 ===" -ForegroundColor Green
Write-Host "Opening: $siteUrl" -ForegroundColor Cyan

# פתיחת האתר בדפדפן ברירת המחדל
Start-Process $siteUrl