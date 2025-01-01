const fs = require('fs');
const path = require('path');

// Read the schema file
const schemaPath = path.join(__dirname, 'auth0.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// Extract event types and descriptions
const eventTypes = [];
for (const [key, value] of Object.entries(schema.definitions)) {
  if (value.description) {
    eventTypes.push({
      event_type: key,
      description: value.description
        .replace(/,/g, ';') // Replace commas with semicolons
        .replace(/`/g, "'") // Replace backticks with single quotes
    });
  }
}

// Sort by event type
eventTypes.sort((a, b) => a.event_type.localeCompare(b.event_type));

// Create CSV content (no header)
const csvContent = eventTypes.map(({ event_type, description }) => 
  `${event_type},"${description}"`
);

// Write to file
const outputPath = path.join(__dirname, 'types.csv');
fs.writeFileSync(outputPath, csvContent.join('\n'), 'utf8');
