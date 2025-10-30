<#
  Finalize submission helper (PowerShell)
  - Prints recommended git commands to prepare repository for submission
  - Optionally executes them when run with -RunGit

  IMPORTANT: This script will run git commands on your repository if -RunGit is used. Review before running.
#>

param(
  [switch]$RunGit = $false,
  [string]$CommitMessageFile = "COMMIT_MESSAGE.txt",
  [string]$ZipDestination = "..\farmstore_submission.zip"
)

Write-Host "Finalize submission helper"

Write-Host "This helper will suggest steps to prepare the repository for submission."
Write-Host "Recommended .gitignore entries (add these manually if you don't want this script to write files):"
Write-Host "  node_modules/"
Write-Host "  dist/"
Write-Host "  coverage/"
Write-Host "  .env"
Write-Host "  data/*.db"
Write-Host "  uploads/"

Write-Host "If you pass -RunGit, the script will run the git commands; otherwise it will only print them."

if ($RunGit) {
  Write-Host "Running: git rm -r --cached node_modules (if present)"
  git rm -r --cached node_modules -f 2>$null
  Write-Host "Adding changes to index"
  git add -A
  Write-Host "Showing git status:"; git status --short

  if (Test-Path $CommitMessageFile) {
    $msg = Get-Content $CommitMessageFile -Raw
    Write-Host "Committing with message from $CommitMessageFile"
    git commit -m "$msg"
  } else {
    Write-Host "No $CommitMessageFile found. Please commit manually.";
  }

  Write-Host "Creating ZIP archive excluding node_modules..."
  Compress-Archive -Path * -DestinationPath $ZipDestination -Force -Exclude node_modules
  Write-Host "ZIP created at: $ZipDestination"
} else {
  Write-Host "Dry run. Commands to run if you want to execute cleanup:"
  Write-Host "  git rm -r --cached node_modules -f"
  Write-Host "  git add -A"
  Write-Host "  git commit -m \"$(Get-Content $CommitMessageFile -Raw)\"  # if COMMIT_MESSAGE.txt exists"
  Write-Host "  Compress-Archive -Path * -DestinationPath $ZipDestination -Force -Exclude node_modules"
}

Write-Host "Done. Review results and push when ready."
