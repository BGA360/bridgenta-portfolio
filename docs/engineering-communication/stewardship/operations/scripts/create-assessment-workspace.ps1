[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$AssessmentId,

    [Parameter(Mandatory = $true)]
    [string]$ProjectName,

    [Parameter(Mandatory = $true)]
    [string]$ArtifactPath,

    [Parameter(Mandatory = $true)]
    [string]$ProductionUrl,

    [Parameter(Mandatory = $false)]
    [string]$Language = "German",

    [Parameter(Mandatory = $false)]
    [string]$ReadingLevel = "CEFR B2",

    [Parameter(Mandatory = $false)]
    [string]$ProjectOwner = "BGA360",

    [Parameter(Mandatory = $false)]
    [string]$FrameworkVersion = "v1.0 GA",

    [Parameter(Mandatory = $false)]
    [string]$AssessmentType = "Full Operational Assessment"
)

# 1. Validate Assessment ID Format
if ($AssessmentId -notmatch "^[A-Z]{2,4}-\d{3}$") {
    Write-Error "Error: Assessment ID '$AssessmentId' has an invalid format. Must match pattern like AC-001 or BA-002."
    exit 1
}

# 2. Define directory paths
$templatesDir = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "../templates"))
$operationsDir = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$targetDir = Join-Path $operationsDir $AssessmentId

# 3. Check if workspace already exists
if (Test-Path $targetDir) {
    Write-Error "Error: Workspace for Assessment ID '$AssessmentId' already exists at '$targetDir'."
    exit 1
}

# 4. Define template file paths
$configTemplatePath = Join-Path $templatesDir "ASSESSMENT-CONFIG.template.yml"
$requestTemplatePath = Join-Path $templatesDir "ASSESSMENT-REQUEST.template.md"

if (-not (Test-Path $configTemplatePath)) {
    Write-Error "Error: Config template not found at '$configTemplatePath'."
    exit 1
}
if (-not (Test-Path $requestTemplatePath)) {
    Write-Error "Error: Request template not found at '$requestTemplatePath'."
    exit 1
}

# Get current date in YYYY-MM-DD
$creationDate = (Get-Date).ToString("yyyy-MM-dd")

# 5. Create target directory
New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
Write-Host "Created workspace directory at: $targetDir"

# Helper function to expand template placeholders
function Expand-Template {
    param (
        [string]$templatePath,
        [string]$outputPath
    )
    $content = Get-Content -Path $templatePath -Raw
    
    $finalUrl = $ProductionUrl
    if ($outputPath -like "*.md") {
        $finalUrl = "[$ProductionUrl]($ProductionUrl)"
    }

    $content = $content -replace "__ASSESSMENT_ID__", $AssessmentId
    $content = $content -replace "__PROJECT_NAME__", $ProjectName
    $content = $content -replace "__FRAMEWORK_VERSION__", $FrameworkVersion
    $content = $content -replace "__ASSESSMENT_TYPE__", $AssessmentType
    $content = $content -replace "__REPOSITORY_ARTIFACT__", $ArtifactPath
    $content = $content -replace "__PRODUCTION_URL__", $finalUrl
    $content = $content -replace "__LANGUAGE__", $Language
    $content = $content -replace "__READING_LEVEL__", $ReadingLevel
    $content = $content -replace "__PROJECT_OWNER__", $ProjectOwner
    $content = $content -replace "__CREATION_DATE__", $creationDate

    Set-Content -Path $outputPath -Value $content -NoNewline
}

# 6. Generate configuration and request documents
$outputPathConfig = Join-Path $targetDir "ASSESSMENT-CONFIG.yml"
$outputPathRequest = Join-Path $targetDir "ASSESSMENT-REQUEST.md"

Expand-Template -templatePath $configTemplatePath -outputPath $outputPathConfig
Expand-Template -templatePath $requestTemplatePath -outputPath $outputPathRequest

Write-Host "Successfully generated assessment workspace files:"
Write-Host "  - ASSESSMENT-CONFIG.yml"
Write-Host "  - ASSESSMENT-REQUEST.md"
Write-Host "Governance Reminder: Only the first phase (Assessment Request) of the lifecycle has been generated. Downstream documents must be created and approved sequentially per BECC operational guidelines."
