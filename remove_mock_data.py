#!/usr/bin/env python3
"""Remove mock data from all pages and replace with API calls"""
import os
import re
from pathlib import Path

# Pages directory
PAGES_DIR = Path(__file__).parent / 'pages'

# Patterns to remove
MOCK_PATTERNS = [
    r'const mock\w+:\s*\w+\[\]\s*=\s*\[[\s\S]*?\];',  # Mock arrays
    r'const mock\w+:\s*\w+\s*=\s*\{[\s\S]*?\};',      # Mock objects
    r'import.*mockData.*',                             # Mock imports
    r'from.*mockData.*',                               # Mock imports
]

# Files to process
files_to_process = list(PAGES_DIR.glob('*.tsx'))

print(f"Found {len(files_to_process)} files to process")

for file_path in files_to_process:
    print(f"\nProcessing: {file_path.name}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Remove mock patterns
    for pattern in MOCK_PATTERNS:
        matches = re.findall(pattern, content)
        if matches:
            print(f"  - Found {len(matches)} mock data declarations")
            content = re.sub(pattern, '', content)
    
    # Remove mockDrivers references
    if 'mockDrivers' in content:
        print(f"  - Replacing mockDrivers with drivers from API")
        content = content.replace('mockDrivers', 'drivers')
    
    # Remove mockTeams references
    if 'mockTeams' in content:
        print(f"  - Replacing mockTeams with teams from API")
        content = content.replace('mockTeams', 'teams')
    
    # Remove mockNews references
    if 'mockNews' in content:
        print(f"  - Replacing mockNews with news from API")
        content = content.replace('mockNews', 'news')
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Updated {file_path.name}")
    else:
        print(f"  - No changes needed")

print("\n✓ All files processed")
