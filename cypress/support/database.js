// Database utility functions for property data management

/**
 * Save property data to location-specific file
 * @param {Array} propertyData - Array of property objects
 * @param {string} location - Search location (used for filename)
 * @param {string} sourceUrl - Actual URL where data was scraped from
 * @param {string} basePath - Base path for saving files
 */
export const savePropertyDatabase = (propertyData, location, sourceUrl, basePath = 'cypress/fixtures') => {
    // Clean location name for filename (remove special characters)
    const cleanLocation = location.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .trim()
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    // Add source URL to each property
    const dataWithSource = propertyData.map(property => ({
        ...property,
        sourceUrl: sourceUrl,
        searchLocation: location,
        extractedAt: new Date().toISOString()
    }))
    
    // Save as JSON with location-specific filename
    const filename = `${cleanLocation}_properties.json`
    cy.writeFile(`${basePath}/${filename}`, dataWithSource, 'utf8')
    cy.log(`💾 Property data saved to ${filename}`)
    
    // Save as CSV for easy viewing
    const csvData = convertToCSV(dataWithSource)
    cy.writeFile(`${basePath}/${cleanLocation}_properties.csv`, csvData, 'utf8')
    cy.log(`📊 Property data saved as CSV: ${cleanLocation}_properties.csv`)
    
    // Save enhanced version with metadata
    const enhancedData = addMetadata(dataWithSource)
    cy.writeFile(`${basePath}/${cleanLocation}_enhanced.json`, enhancedData, 'utf8')
    cy.log(`✨ Enhanced database saved: ${cleanLocation}_enhanced.json`)
    
    // Generate and save statistics
    const stats = generateStatistics(enhancedData)
    cy.writeFile(`${basePath}/${cleanLocation}_statistics.json`, stats, 'utf8')
    cy.log(`📈 Property statistics saved: ${cleanLocation}_statistics.json`)
    
    // Save with timestamp for historical tracking
    cy.writeFile(`${basePath}/${cleanLocation}_${timestamp}.json`, dataWithSource, 'utf8')
    cy.log(`🕒 Historical data saved: ${cleanLocation}_${timestamp}.json`)
}

/**
 * Convert property data to CSV format
 * @param {Array} data - Array of property objects
 * @returns {string} CSV formatted string
 */
export const convertToCSV = (data) => {
    if (!data || data.length === 0) return ''
    
    const headers = [
        'Title', 'Description', 'Price', 'PriceNumeric', 'Location', 'PropertyType',
        'Floor', 'Bedrooms', 'Bathrooms', 'Area', 'UploadTime', 'SourceURL',
        'SearchLocation', 'ExtractedAt', 'TitleHash', 'LocationHash', 'PriceHash'
    ]
    
    const csvContent = [
        headers.join(','),
        ...data.map(property => [
            `"${property.title.replace(/"/g, '""')}"`,
            `"${property.description.replace(/"/g, '""')}"`,
            `"${property.price}"`,
            `"${property.priceNumeric || 0}"`,
            `"${property.location}"`,
            `"${property.propertyType || 'Unknown'}"`,
            `"${property.floor}"`,
            `"${property.bedrooms}"`,
            `"${property.bathrooms}"`,
            `"${property.area}"`,
            `"${property.uploadTime}"`,
            `"${property.sourceUrl || ''}"`,
            `"${property.searchLocation || ''}"`,
            `"${property.extractedAt || new Date().toISOString()}"`,
            `"${property.titleHash}"`,
            `"${property.locationHash}"`,
            `"${property.priceHash}"`
        ].join(','))
    ].join('\n')
    
    return csvContent
}

/**
 * Add metadata to property data
 * @param {Array} data - Array of property objects
 * @returns {Array} Enhanced property data with metadata
 */
export const addMetadata = (data) => {
    return data.map(property => ({
        ...property,
        id: generatePropertyId(property),
        extractedAt: new Date().toISOString(),
        source: 'OLX Pakistan',
        dataVersion: '1.0'
    }))
}

/**
 * Generate unique property ID
 * @param {Object} property - Property object
 * @returns {string} Unique property ID
 */
export const generatePropertyId = (property) => {
    const titleHash = property.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10)
    const priceHash = property.price.replace(/[^0-9]/g, '').substring(0, 5)
    const locationHash = property.location.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 5)
    return `prop_${titleHash}_${priceHash}_${locationHash}`
}

/**
 * Generate comprehensive statistics from property data
 * @param {Array} data - Array of property objects
 * @returns {Object} Statistics object
 */
export const generateStatistics = (data) => {
    const stats = {
        totalProperties: data.length,
        extractionDate: new Date().toISOString(),
        priceRanges: {
            under50k: 0,
            under1lac: 0,
            under2lac: 0,
            above2lac: 0
        },
        locations: {},
        uploadTimeDistribution: {
            hours: 0,
            days: 0,
            weeks: 0,
            months: 0
        },
        propertyTypes: {},
        averagePrice: 0,
        medianPrice: 0
    }
    
    const prices = []
    
    data.forEach(property => {
        // Price analysis
        const priceText = property.price.toLowerCase()
        let priceValue = 0
        
        if (priceText.includes('rs')) {
            priceValue = parseInt(priceText.replace(/[^\d]/g, ''))
            prices.push(priceValue)
            
            if (priceValue < 50000) stats.priceRanges.under50k++
            else if (priceValue < 100000) stats.priceRanges.under1lac++
            else if (priceValue < 200000) stats.priceRanges.under2lac++
            else stats.priceRanges.above2lac++
        } else if (priceText.includes('lac')) {
            priceValue = parseFloat(priceText.replace(/[^\d.]/g, '')) * 100000
            prices.push(priceValue)
            
            if (priceValue < 50000) stats.priceRanges.under50k++
            else if (priceValue < 100000) stats.priceRanges.under1lac++
            else if (priceValue < 200000) stats.priceRanges.under2lac++
            else stats.priceRanges.above2lac++
        }
        
        // Location analysis
        const location = property.location.split(',')[0].trim()
        stats.locations[location] = (stats.locations[location] || 0) + 1
        
        // Property type analysis
        const title = property.title.toLowerCase()
        if (title.includes('office')) stats.propertyTypes.office = (stats.propertyTypes.office || 0) + 1
        else if (title.includes('shop')) stats.propertyTypes.shop = (stats.propertyTypes.shop || 0) + 1
        else if (title.includes('hall')) stats.propertyTypes.hall = (stats.propertyTypes.hall || 0) + 1
        else if (title.includes('floor')) stats.propertyTypes.floor = (stats.propertyTypes.floor || 0) + 1
        else stats.propertyTypes.other = (stats.propertyTypes.other || 0) + 1
        
        // Upload time analysis
        const timeText = property.uploadTime.toLowerCase()
        if (timeText.includes('hour')) stats.uploadTimeDistribution.hours++
        else if (timeText.includes('day')) stats.uploadTimeDistribution.days++
        else if (timeText.includes('week')) stats.uploadTimeDistribution.weeks++
        else if (timeText.includes('month')) stats.uploadTimeDistribution.months++
    })
    
    // Calculate average and median prices
    if (prices.length > 0) {
        stats.averagePrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        stats.medianPrice = calculateMedian(prices)
    }
    
    return stats
}

/**
 * Calculate median value from array of numbers
 * @param {Array} numbers - Array of numbers
 * @returns {number} Median value
 */
const calculateMedian = (numbers) => {
    const sorted = numbers.slice().sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    
    if (sorted.length % 2 === 0) {
        return Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    } else {
        return sorted[middle]
    }
}

/**
 * Load existing database
 * @param {string} filePath - Path to database file
 * @returns {Cypress.Chainable} Cypress command that resolves with database data
 */
export const loadDatabase = (filePath = 'cypress/fixtures/property_database.json') => {
    return cy.readFile(filePath, 'utf8')
}

/**
 * Merge new data with existing database using hash-based duplication detection
 * @param {Array} newData - New property data
 * @param {Array} existingData - Existing database data
 * @returns {Object} Object containing merged data and duplication report
 */
export const mergeDatabase = (newData, existingData) => {
    const merged = [...existingData]
    const duplicates = []
    const newEntries = []
    
    newData.forEach(newProperty => {
        // Check for duplicates using hash comparison (more reliable)
        const isDuplicate = existingData.some(existing => {
            // Primary check: exact title and price match
            if (existing.title === newProperty.title && existing.price === newProperty.price) {
                return true
            }
            
            // Secondary check: hash-based comparison for similar properties
            if (existing.titleHash === newProperty.titleHash && 
                existing.locationHash === newProperty.locationHash &&
                Math.abs(existing.priceNumeric - newProperty.priceNumeric) < 1000) {
                return true
            }
            
            return false
        })
        
        if (isDuplicate) {
            duplicates.push({
                newProperty: newProperty,
                reason: 'Duplicate detected',
                matchingFields: {
                    title: newProperty.title,
                    price: newProperty.price,
                    location: newProperty.location
                }
            })
        } else {
            merged.push(newProperty)
            newEntries.push(newProperty)
        }
    })
    
    return {
        mergedData: merged,
        duplicates: duplicates,
        newEntries: newEntries,
        summary: {
            totalExisting: existingData.length,
            totalNew: newData.length,
            duplicatesFound: duplicates.length,
            newEntriesAdded: newEntries.length,
            finalTotal: merged.length
        }
    }
}

/**
 * Validate and clean property data
 * @param {Array} data - Array of property objects
 * @returns {Object} Object containing cleaned data and validation report
 */
export const validateAndCleanData = (data) => {
    const cleanedData = []
    const validationErrors = []
    
    data.forEach((property, index) => {
        const errors = []
        
        // Required field validation
        if (!property.title || property.title.trim() === '') {
            errors.push('Missing or empty title')
        }
        
        if (!property.price || property.price.trim() === '') {
            errors.push('Missing or empty price')
        }
        
        if (!property.location || property.location.trim() === '') {
            errors.push('Missing or empty location')
        }
        
        // Data quality validation
        if (property.priceNumeric === 0 && property.price && !property.price.toLowerCase().includes('negotiable')) {
            errors.push('Invalid price format - could not extract numeric value')
        }
        
        if (property.title && property.title.length < 10) {
            errors.push('Title seems too short')
        }
        
        if (errors.length > 0) {
            validationErrors.push({
                index: index,
                property: property,
                errors: errors
            })
        } else {
            // Clean the data
            const cleanedProperty = {
                ...property,
                title: property.title.trim(),
                description: property.description ? property.description.trim() : property.title.trim(),
                price: property.price.trim(),
                location: property.location.trim(),
                propertyType: property.propertyType || 'Unknown',
                floor: property.floor === 'Not specified' ? '' : property.floor,
                bedrooms: property.bedrooms === 'Not specified' ? '' : property.bedrooms,
                bathrooms: property.bathrooms === 'Not specified' ? '' : property.bathrooms,
                area: property.area === 'Not specified' ? '' : property.area,
                uploadTime: property.uploadTime === 'Not specified' ? '' : property.uploadTime
            }
            
            cleanedData.push(cleanedProperty)
        }
    })
    
    return {
        cleanedData: cleanedData,
        validationErrors: validationErrors,
        summary: {
            totalInput: data.length,
            validEntries: cleanedData.length,
            invalidEntries: validationErrors.length,
            validationRate: ((cleanedData.length / data.length) * 100).toFixed(2) + '%'
        }
    }
}
