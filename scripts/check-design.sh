#!/bin/bash

# Configuration
REPO_PATH="/Users/ronellbradley/Desktop/Bradley-Health"
DESIGN_LOG="$REPO_PATH/scripts/design-check.log"
FEATURE_LOG="$REPO_PATH/scripts/feature-test.log"

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show section header
show_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Function to show summary
show_summary() {
    local log_file=$1
    local type=$2
    local count=$(grep -c "\[$type\]" "$log_file")
    if [ "$count" -gt 0 ]; then
        case $type in
            "ERROR")
                echo -e "${RED}$type: $count${NC}"
                ;;
            "WARNING")
                echo -e "${YELLOW}$type: $count${NC}"
                ;;
            "PASSED")
                echo -e "${GREEN}$type: $count${NC}"
                ;;
            "FIXES")
                echo -e "${GREEN}$type: $count${NC}"
                ;;
        esac
    fi
}

# Run design check
show_header "Bradley Health Design Check"
echo "Running comprehensive design check..."
node "$REPO_PATH/scripts/design-check.js" 2>&1 | tee "$DESIGN_LOG"

# Run feature tests
show_header "Feature Testing"
echo "Running feature tests with automatic fixes..."
node "$REPO_PATH/scripts/feature-test.js" 2>&1 | tee "$FEATURE_LOG"

# Show combined summary
show_header "Test Summary"
echo -e "\nDesign Check Results:"
show_summary "$DESIGN_LOG" "ERROR"
show_summary "$DESIGN_LOG" "WARNING"
show_summary "$DESIGN_LOG" "PASSED"

echo -e "\nFeature Test Results:"
show_summary "$FEATURE_LOG" "ERROR"
show_summary "$FEATURE_LOG" "WARNING"
show_summary "$FEATURE_LOG" "PASSED"
show_summary "$FEATURE_LOG" "FIXES"

# Check overall status
DESIGN_ERRORS=$(grep -c "\[ERROR\]" "$DESIGN_LOG")
FEATURE_ERRORS=$(grep -c "\[ERROR\]" "$FEATURE_LOG")
TOTAL_ERRORS=$((DESIGN_ERRORS + FEATURE_ERRORS))

if [ "$TOTAL_ERRORS" -eq 0 ]; then
    echo -e "\n${GREEN}All checks passed successfully!${NC}"
    echo "Full reports saved to:"
    echo "- Design Check: $DESIGN_LOG"
    echo "- Feature Test: $FEATURE_LOG"
    exit 0
else
    echo -e "\n${RED}Found $TOTAL_ERRORS issues that need attention.${NC}"
    echo "Please review the reports above and fix any remaining errors."
    echo "Full reports saved to:"
    echo "- Design Check: $DESIGN_LOG"
    echo "- Feature Test: $FEATURE_LOG"
    exit 1
fi 