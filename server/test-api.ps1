# API Test Examples using PowerShell

# Base URL
$baseUrl = "http://localhost:5000/api"

# Test 1: Health Check
Write-Host "`n=== Testing Health Check ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/health" -Method Get | ConvertTo-Json

# Test 2: Register a new user
Write-Host "`n=== Testing User Registration ===" -ForegroundColor Cyan
$registerBody = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
$token = $registerResponse.data.token
$registerResponse | ConvertTo-Json

# Test 3: Login
Write-Host "`n=== Testing User Login ===" -ForegroundColor Cyan
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$loginResponse | ConvertTo-Json

# Test 4: Get current user (Protected route)
Write-Host "`n=== Testing Protected Route (Get User Profile) ===" -ForegroundColor Cyan
$headers = @{
    Authorization = "Bearer $token"
}
Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers $headers | ConvertTo-Json

Write-Host "`n=== All Tests Completed! ===" -ForegroundColor Green
