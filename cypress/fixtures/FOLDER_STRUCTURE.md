# Property Data Folder Structure

This document describes the organized folder structure for property data extraction.

## 📁 Folder Organization

### **Location-Based Structure**
```
cypress/fixtures/
├── bahria_town_rawalpindi/          # Bahria Town Rawalpindi properties
│   ├── properties.json              # Main property data
│   ├── properties.csv               # CSV export for easy viewing
│   ├── enhanced.json                # Enhanced data with metadata
│   ├── statistics.json              # Market statistics
│   ├── location_summary.json        # Location overview
│   └── historical_*.json            # Historical data snapshots
├── pwd_islamabad/                   # PWD Islamabad properties
│   ├── properties.json
│   ├── properties.csv
│   ├── enhanced.json
│   ├── statistics.json
│   ├── location_summary.json
│   └── historical_*.json
└── islamabad/                       # Islamabad properties
    ├── properties.json
    ├── properties.csv
    ├── enhanced.json
    ├── statistics.json
    ├── location_summary.json
    └── historical_*.json
```

## 📄 File Descriptions

### **Main Files (per location)**
- **`properties.json`** - Raw property data extracted from OLX
- **`properties.csv`** - CSV format for Excel/Google Sheets
- **`enhanced.json`** - Data with additional metadata and IDs
- **`statistics.json`** - Market analysis and statistics
- **`location_summary.json`** - Location overview and file index

### **Historical Files**
- **`historical_YYYY-MM-DDTHH-mm-ss-sssZ.json`** - Timestamped snapshots

## 🔄 Data Flow

1. **Extraction** → Raw property data collected
2. **Processing** → Data cleaned and validated
3. **Enhancement** → Metadata and statistics added
4. **Organization** → Files saved to location-specific folders
5. **Historical** → Timestamped backups created

## 📊 Data Structure

### **Property Record**
```json
{
  "title": "Office Space for Rent",
  "price": "Rs 50,000",
  "location": "Blue Area, Islamabad",
  "contactNumber": "+92-3355890491",
  "propertyType": "Office",
  "bedrooms": "Not specified",
  "bathrooms": "2",
  "area": "1200 Sq. M.",
  "uploadTime": "2 hours ago",
  "titleHash": "abc123",
  "locationHash": "def456",
  "priceHash": "ghi789",
  "contactHash": "jkl012",
  "extractedAt": "2024-01-15T10:30:45.123Z",
  "source": "OLX Pakistan",
  "searchLocation": "Islamabad",
  "searchPropertyTitle": "Office for Rent",
  "listingIndex": 1
}
```

### **Location Summary**
```json
{
  "location": "Islamabad",
  "cleanLocation": "islamabad",
  "totalProperties": 25,
  "lastUpdated": "2024-01-15T10:30:45.123Z",
  "sourceUrl": "https://www.olx.com.pk/...",
  "files": {
    "main": "properties.json",
    "csv": "properties.csv",
    "enhanced": "enhanced.json",
    "statistics": "statistics.json",
    "historical": "historical_2024-01-15T10-30-45-123Z.json"
  }
}
```

## 🚀 Usage

### **Accessing Data**
```javascript
// Read main property data
cy.readFile('cypress/fixtures/islamabad/properties.json')

// Read CSV data
cy.readFile('cypress/fixtures/islamabad/properties.csv')

// Read statistics
cy.readFile('cypress/fixtures/islamabad/statistics.json')

// Read location summary
cy.readFile('cypress/fixtures/islamabad/location_summary.json')
```

### **Running Organization**
```javascript
// Organize existing files
organizeFilesByLocation()

// Save new data (automatically organized)
savePropertyDatabase(propertyData, location, sourceUrl)
```

## ✅ Benefits

1. **🗂️ Easy Navigation** - Files organized by location
2. **📊 Better Management** - Clear file purposes
3. **🔄 Historical Tracking** - Timestamped backups
4. **📈 Analytics Ready** - Statistics and summaries
5. **🛠️ Developer Friendly** - Consistent structure

## 🔧 Maintenance

- **New Locations** - Automatically create new folders
- **File Cleanup** - Remove old historical files periodically
- **Data Validation** - Check location_summary.json for consistency
- **Backup Strategy** - Keep important historical snapshots
