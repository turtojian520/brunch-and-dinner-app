#!/bin/bash

# WhatToEat iOS Setup Script
# This script helps set up iOS development environment

echo "=================================="
echo "WhatToEat iOS Setup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

# Check if Homebrew is installed
echo "Step 1: Checking Homebrew..."
if command -v brew &> /dev/null; then
    print_status "Homebrew is installed"
    BREW_INSTALLED=true
else
    print_warning "Homebrew not found"
    echo "Would you like to install Homebrew? (y/n)"
    read -r install_brew
    if [[ $install_brew == "y" ]]; then
        echo "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        BREW_INSTALLED=true
    else
        BREW_INSTALLED=false
    fi
fi

# Check if CocoaPods is installed
echo ""
echo "Step 2: Checking CocoaPods..."
if command -v pod &> /dev/null; then
    print_status "CocoaPods is installed ($(pod --version))"
    POD_INSTALLED=true
else
    print_warning "CocoaPods not found"

    if [ "$BREW_INSTALLED" = true ]; then
        echo "Installing CocoaPods via Homebrew..."
        brew install cocoapods
        POD_INSTALLED=true
    else
        echo "Please install CocoaPods manually:"
        echo "Option 1 (Recommended): Install Homebrew first, then run this script again"
        echo "Option 2: sudo gem install cocoapods"
        POD_INSTALLED=false
    fi
fi

# Check Xcode
echo ""
echo "Step 3: Checking Xcode..."
if command -v xcodebuild &> /dev/null; then
    print_status "Xcode is installed ($(xcodebuild -version | head -n1))"
    XCODE_INSTALLED=true
else
    print_error "Xcode not found"
    echo "Please install Xcode from the App Store"
    XCODE_INSTALLED=false
fi

# Check Xcode Command Line Tools
if [ "$XCODE_INSTALLED" = true ]; then
    if xcode-select -p &> /dev/null; then
        print_status "Xcode Command Line Tools installed"
    else
        print_warning "Installing Xcode Command Line Tools..."
        xcode-select --install
    fi
fi

# Check Node.js
echo ""
echo "Step 4: Checking Node.js..."
if command -v node &> /dev/null; then
    print_status "Node.js is installed ($(node --version))"
else
    print_error "Node.js not found"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Summary
echo ""
echo "=================================="
echo "Setup Summary"
echo "=================================="
echo ""

if [ "$BREW_INSTALLED" = true ]; then
    print_status "Homebrew: Installed"
else
    print_error "Homebrew: Not Installed"
fi

if [ "$POD_INSTALLED" = true ]; then
    print_status "CocoaPods: Installed"
else
    print_error "CocoaPods: Not Installed"
fi

if [ "$XCODE_INSTALLED" = true ]; then
    print_status "Xcode: Installed"
else
    print_error "Xcode: Not Installed"
fi

# If all dependencies are installed, proceed with iOS setup
if [ "$POD_INSTALLED" = true ] && [ "$XCODE_INSTALLED" = true ]; then
    echo ""
    echo "=================================="
    echo "All dependencies satisfied!"
    echo "=================================="
    echo ""
    echo "Choose your preferred method to run the app:"
    echo ""
    echo "1. Build and run on iOS simulator (recommended)"
    echo "   Command: npx expo run:ios"
    echo ""
    echo "2. Use Expo Go (simpler, but limited)"
    echo "   Command: npx expo start"
    echo "   Then press 'i' to open in iOS simulator"
    echo ""
    echo "3. Run on physical iPhone"
    echo "   Command: npx expo start"
    echo "   Then scan QR code with Expo Go app"
    echo ""

    read -p "Would you like to build and run on iOS simulator now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Building iOS app..."
        npx expo run:ios
    fi
else
    echo ""
    print_error "Some dependencies are missing. Please install them and run this script again."
    echo ""
    echo "Quick install commands:"
    if [ "$BREW_INSTALLED" = false ]; then
        echo "- Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    fi
    if [ "$POD_INSTALLED" = false ]; then
        echo "- CocoaPods: brew install cocoapods"
    fi
    if [ "$XCODE_INSTALLED" = false ]; then
        echo "- Xcode: Install from App Store"
    fi
fi
