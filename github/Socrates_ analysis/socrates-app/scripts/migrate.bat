@echo off
REM =====================================================
REM Database Migration Helper
REM =====================================================

echo.
echo =====================================================
echo   Project Socrates - Database Migration
echo =====================================================
echo.
echo Please follow these steps to execute the database migrations:
echo.
echo 1. Open Supabase SQL Editor:
echo    https://app.supabase.com/project/_/sql
echo.
echo 2. Copy and execute each migration in order:
echo.
echo    [1] Add parent_id column
echo    [2] Add phone column
echo    [3] Fix role constraint
echo.
echo Press any key to open the migration guide...
pause >nul

start "" scripts/MIGRATE.md

echo.
echo Migration guide opened. Please execute the SQL scripts in Supabase.
echo.
echo After completing the migrations, run: node scripts/verify-migrations.js
echo.
pause
