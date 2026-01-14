# Complete API Test Script for Task Management System
# Safe ASCII version without Unicode characters

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TASK MANAGEMENT SYSTEM - API TESTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"
$token = $null
$testsPassed = 0
$testsFailed = 0

# Test 1: Health Check
Write-Host "Test 1: Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "  [PASS] Health endpoint: $($health.message)" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  [FAIL] Health check failed: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 2: Register User
Write-Host "`nTest 2: User Registration..." -ForegroundColor Yellow
$registerBody = @{
    username = "testuser_$(Get-Random -Maximum 9999)"
    email = "test$(Get-Random -Maximum 9999)@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    $token = $registerResponse.data.token
    Write-Host "  [PASS] User registered: $($registerResponse.data.user.username)" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    $testsPassed++
} catch {
    Write-Host "  [FAIL] Registration failed: $_" -ForegroundColor Red
    $testsFailed++
    Write-Host "`nCannot continue without authentication. Exiting..." -ForegroundColor Red
    exit 1
}

# Set up headers for authenticated requests
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 3: Create Multiple Tasks
Write-Host "`nTest 3: Creating Sample Tasks..." -ForegroundColor Yellow

$tasks = @(
    @{
        title = "Complete project documentation"
        description = "Write comprehensive API documentation"
        category = "Work"
        priority = "High"
        status = "Pending"
        dueDate = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss")
    },
    @{
        title = "Review pull requests"
        description = "Review team's code submissions"
        category = "Work"
        priority = "High"
        status = "In Progress"
        dueDate = (Get-Date).AddDays(2).ToString("yyyy-MM-ddTHH:mm:ss")
    },
    @{
        title = "Buy groceries"
        description = "Weekly grocery shopping"
        category = "Personal"
        priority = "Medium"
        status = "Pending"
        dueDate = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss")
    },
    @{
        title = "Update unit tests"
        description = "Add test coverage for new features"
        category = "Work"
        priority = "Medium"
        status = "Completed"
        dueDate = (Get-Date).AddDays(-1).ToString("yyyy-MM-ddTHH:mm:ss")
    },
    @{
        title = "Plan vacation"
        description = "Book flights and hotel"
        category = "Personal"
        priority = "Low"
        status = "Pending"
        dueDate = (Get-Date).AddDays(30).ToString("yyyy-MM-ddTHH:mm:ss")
    }
)

$taskIds = @()
foreach ($task in $tasks) {
    try {
        $taskBody = $task | ConvertTo-Json
        $createResponse = Invoke-RestMethod -Uri "$baseUrl/tasks" -Method Post -Headers $headers -Body $taskBody
        
        # Extract task ID from response
        if ($createResponse.data -and $createResponse.data._id) {
            $taskIds += $createResponse.data._id
            Write-Host "  [PASS] Created: $($task.title) [$($task.priority) / $($task.status)] - ID: $($createResponse.data._id)" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Task created but no ID received: $($task.title)" -ForegroundColor Yellow
        }
        $testsPassed++
    } catch {
        Write-Host "  [FAIL] Failed to create task: $($task.title) - $_" -ForegroundColor Red
        $testsFailed++
    }
}

# Test 4: Get All Tasks
Write-Host "`nTest 4: Fetching All Tasks..." -ForegroundColor Yellow
try {
    $allTasks = Invoke-RestMethod -Uri "$baseUrl/tasks" -Method Get -Headers $headers
    Write-Host "  [PASS] Retrieved $($allTasks.data.Count) tasks" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  [FAIL] Failed to fetch tasks: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 5: Filter by Status
Write-Host "`nTest 5: Testing Filters - By Status (Pending)..." -ForegroundColor Yellow
try {
    $pendingTasks = Invoke-RestMethod -Uri "$baseUrl/tasks?status=Pending" -Method Get -Headers $headers
    Write-Host "  [PASS] Found $($pendingTasks.data.Count) pending tasks" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  [FAIL] Status filter failed: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 6: Filter by Priority
Write-Host "`nTest 6: Testing Filters - By Priority (High)..." -ForegroundColor Yellow
try {
    $highPriorityTasks = Invoke-RestMethod -Uri "$baseUrl/tasks?priority=High" -Method Get -Headers $headers
    Write-Host "  [PASS] Found $($highPriorityTasks.data.Count) high priority tasks" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  [FAIL] Priority filter failed: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 7: Filter by Category
Write-Host "`nTest 7: Testing Filters - By Category (Work)..." -ForegroundColor Yellow
try {
    $workTasks = Invoke-RestMethod -Uri "$baseUrl/tasks?category=Work" -Method Get -Headers $headers
    Write-Host "  [PASS] Found $($workTasks.data.Count) work tasks" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  [FAIL] Category filter failed: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 8: Sorting
Write-Host "`nTest 8: Testing Sorting - By Due Date (Ascending)..." -ForegroundColor Yellow
try {
    $sortedUrl = "$baseUrl/tasks?sortBy=dueDate&order=asc"
    $sortedTasks = Invoke-RestMethod -Uri $sortedUrl -Method Get -Headers $headers
    Write-Host "  [PASS] Retrieved $($sortedTasks.data.Count) tasks sorted by due date" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  [FAIL] Sorting failed: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 9: Get Task by ID
if ($taskIds.Count -gt 0) {
    Write-Host "`nTest 9: Get Task by ID..." -ForegroundColor Yellow
    try {
        $singleTask = Invoke-RestMethod -Uri "$baseUrl/tasks/$($taskIds[0])" -Method Get -Headers $headers
        Write-Host "  [PASS] Retrieved task: $($singleTask.data.title)" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "  [FAIL] Failed to get task by ID: $_" -ForegroundColor Red
        $testsFailed++
    }
}

# Test 10: Update Task
Write-Host "`nTest 10: Update Task..." -ForegroundColor Yellow
if ($taskIds.Count -gt 0) {
    $updateBody = @{
        status = "Completed"
        description = "Updated description - task completed successfully"
    } | ConvertTo-Json
    
    try {
        $taskId = $taskIds[0]
        Write-Host "  Updating task ID: $taskId" -ForegroundColor Gray
        $updateResponse = Invoke-RestMethod -Uri "$baseUrl/tasks/$taskId" -Method Put -Headers $headers -Body $updateBody
        Write-Host "  [PASS] Updated task status to: $($updateResponse.data.status)" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "  [FAIL] Failed to update task: $_" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  [SKIP] No task IDs available" -ForegroundColor Yellow
}

# Test 11: Get Statistics
Write-Host "`nTest 11: Get Task Statistics..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/tasks/stats" -Method Get -Headers $headers
    $byStatusCount = if ($stats.data.byStatus) { $stats.data.byStatus.Count } else { 0 }
    $byPriorityCount = if ($stats.data.byPriority) { $stats.data.byPriority.Count } else { 0 }
    $topCategoriesCount = if ($stats.data.topCategories) { $stats.data.topCategories.Count } else { 0 }
    
    Write-Host "  [PASS] Statistics retrieved successfully:" -ForegroundColor Green
    Write-Host "    By Status: $byStatusCount groups" -ForegroundColor Gray
    Write-Host "    By Priority: $byPriorityCount groups" -ForegroundColor Gray
    Write-Host "    Top Categories: $topCategoriesCount categories" -ForegroundColor Gray
    $testsPassed++
} catch {
    Write-Host "  [FAIL] Failed to get statistics: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 12: Delete Task
Write-Host "`nTest 12: Delete Task..." -ForegroundColor Yellow
if ($taskIds.Count -gt 1) {
    try {
        $taskId = $taskIds[1]
        Write-Host "  Deleting task ID: $taskId" -ForegroundColor Gray
        $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/tasks/$taskId" -Method Delete -Headers $headers
        Write-Host "  [PASS] Task deleted successfully" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "  [FAIL] Failed to delete task: $_" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "  [SKIP] Need at least 2 task IDs (have $($taskIds.Count))" -ForegroundColor Yellow
}

# Test 13: Get Current User
Write-Host "`nTest 13: Get Current User Profile..." -ForegroundColor Yellow
try {
    $userProfile = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers $headers
    $username = if ($userProfile.data.username) { $userProfile.data.username } else { "(none)" }
    $email = if ($userProfile.data.email) { $userProfile.data.email } else { "(none)" }
    Write-Host "  [PASS] User profile: $username ($email)" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "  [FAIL] Failed to get user profile: $_" -ForegroundColor Red
    $testsFailed++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host "  Passed: $testsPassed" -ForegroundColor Green
Write-Host "  Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host "========================================`n" -ForegroundColor Cyan

if ($testsFailed -eq 0) {
    Write-Host "All tests passed! API is working correctly." -ForegroundColor Green
    Write-Host "You can now view the API documentation at: http://localhost:5000/api-docs" -ForegroundColor Blue
} else {
    Write-Host "Some tests failed. Please check the errors above." -ForegroundColor Red
}
