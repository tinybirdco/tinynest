#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Find all immediate child directories
for dir in "$SCRIPT_DIR"/*/ ; do
    if [ -d "$dir" ]; then
        # Check if create_csv.js exists in the directory
        if [ -f "$dir/create_csv.js" ]; then
            echo "Processing $dir..."
            # Run the create_csv.js script
            node "$dir/create_csv.js"
        fi
    fi
done

# Create the final CSV with header
echo "tool,event_type,description" > "$SCRIPT_DIR/event_types.csv"

# Append each types.csv file with the directory name as the tool
for dir in "$SCRIPT_DIR"/*/ ; do
    if [ -d "$dir" ]; then
        # Get the directory name as the tool name
        tool=$(basename "$dir")
        if [ -f "$dir/types.csv" ]; then
            # Prepend the tool name to each line and append to final CSV
            while IFS= read -r line; do
                echo "$tool,$line" >> "$SCRIPT_DIR/event_types.csv"
            done < "$dir/types.csv"
        fi
    fi
done

echo "Compilation complete. Output file: $SCRIPT_DIR/event_types.csv"