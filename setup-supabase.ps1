# ============================================================
# سكريبت إعداد Supabase - رمز الإبداع
# ============================================================
# الاستخدام:
#   .\setup-supabase.ps1 -AccessToken "sbp_xxxxxxx"
#
# للحصول على Access Token:
#   1. افتح https://supabase.com/dashboard/account/tokens
#   2. انقر "Generate new token"
#   3. الصق التوكن هنا
# ============================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN
)

$PROJECT_REF = "ndfuwaebrubtcbtqfzbj"
$PROJECT_DIR = $PSScriptRoot

if (-not $AccessToken) {
    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Red
    Write-Host "  لم يتم تقديم Access Token!" -ForegroundColor Red
    Write-Host "==============================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "للحصول على Access Token:" -ForegroundColor Yellow
    Write-Host "  1. افتح: https://supabase.com/dashboard/account/tokens" -ForegroundColor Yellow
    Write-Host "  2. انقر 'Generate new token'" -ForegroundColor Yellow
    Write-Host "  3. شغّل السكريبت:" -ForegroundColor Yellow
    Write-Host "     .\setup-supabase.ps1 -AccessToken 'sbp_xxxxx'" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "🔗 ربط مشروع Supabase: $PROJECT_REF" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get project API keys via Management API
Write-Host "📋 جلب مفاتيح API..." -ForegroundColor Yellow
try {
    $keysResp = Invoke-RestMethod `
        -Uri "https://api.supabase.com/v1/projects/$PROJECT_REF/api-keys" `
        -Headers @{ "Authorization" = "Bearer $AccessToken" } `
        -Method GET `
        -ErrorAction Stop

    $anonKey = ($keysResp | Where-Object { $_.name -eq "anon" }).api_key
    $serviceKey = ($keysResp | Where-Object { $_.name -eq "service_role" }).api_key

    if ($anonKey) {
        Write-Host "  ✅ تم جلب Anon Key" -ForegroundColor Green
        
        # Update .env file
        $envPath = Join-Path $PROJECT_DIR ".env"
        if (Test-Path $envPath) {
            $envContent = Get-Content $envPath -Raw
            $envContent = $envContent -replace 'VITE_SUPABASE_ANON_KEY=.*', "VITE_SUPABASE_ANON_KEY=$anonKey"
            Set-Content $envPath $envContent -NoNewline
            Write-Host "  ✅ تم تحديث .env بالمفتاح الصحيح" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "  ⚠️  لم يمكن جلب المفاتيح: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 2: Apply schema via npx supabase
Write-Host ""
Write-Host "📦 تطبيق مخطط قاعدة البيانات..." -ForegroundColor Yellow

Set-Location $PROJECT_DIR

try {
    $env:SUPABASE_ACCESS_TOKEN = $AccessToken
    
    Write-Host "  ربط المشروع..." -ForegroundColor Cyan
    npx supabase link --project-ref $PROJECT_REF 2>&1
    
    Write-Host "  رفع المخطط..." -ForegroundColor Cyan
    npx supabase db push 2>&1
    
    Write-Host ""
    Write-Host "✅ تم تطبيق المخطط بنجاح!" -ForegroundColor Green
} catch {
    Write-Host "  ❌ خطأ: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "بديل: استخدم Supabase SQL Editor:" -ForegroundColor Yellow
    Write-Host "  https://supabase.com/dashboard/project/$PROJECT_REF/sql/new" -ForegroundColor Cyan
    Write-Host "  الصق محتوى الملف: supabase-schema.sql ثم شغّله" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  لتشغيل التطبيق:" -ForegroundColor Green
Write-Host "  corepack pnpm dev" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Green
