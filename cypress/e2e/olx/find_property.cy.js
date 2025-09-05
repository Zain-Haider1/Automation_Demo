import { LOCATIONS, PROPERTY_TITLES } from '../../support/data'
import { organizeFilesByLocation, savePropertyDatabase, validateAndCleanData } from '../../support/database'

// Helper functions for data extraction and validation
const extractPropertyType = (title) => {
    if (!title) return 'Unknown'
    
    const titleLower = title.toLowerCase()
    if (titleLower.includes('office')) return 'Office'
    if (titleLower.includes('shop')) return 'Shop'
    if (titleLower.includes('hall')) return 'Hall'
    if (titleLower.includes('floor')) return 'Floor'
    if (titleLower.includes('room')) return 'Room'
    if (titleLower.includes('apartment')) return 'Apartment'
    if (titleLower.includes('house')) return 'House'
    if (titleLower.includes('villa')) return 'Villa'
    if (titleLower.includes('commercial')) return 'Commercial'
    if (titleLower.includes('residential')) return 'Residential'
    
    return 'Other'
}

const extractNumericPrice = (priceText) => {
    if (!priceText) return 0
    
    const priceLower = priceText.toLowerCase()
    let numericValue = 0
    
    if (priceLower.includes('lac')) {
        const match = priceText.match(/(\d+(?:\.\d+)?)/)
        if (match) {
            numericValue = parseFloat(match[1]) * 100000
        }
    } else if (priceLower.includes('rs')) {
        const match = priceText.match(/(\d+(?:,\d+)*)/)
        if (match) {
            numericValue = parseInt(match[1].replace(/,/g, ''))
        }
    }
    
    return numericValue
}

const generateHash = (text) => {
    if (!text) return ''
    
    // Simple hash function for duplication detection
    let hash = 0
    const cleanText = text.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36)
}

const cleanContactNumber = (contactNumber) => {
    if (!contactNumber || contactNumber === 'Not available') return 'Not available'
    
    // Remove common prefixes and clean the number
    let cleaned = contactNumber
        .replace(/^\+92-?/, '') // Remove +92- prefix
        .replace(/^92-?/, '')   // Remove 92- prefix
        .replace(/[^\d]/g, '')  // Remove all non-digits
        .trim()
    
    // Add back the +92 prefix if it's a valid Pakistani number
    if (cleaned.length >= 10 && cleaned.length <= 11) {
        return `+92-${cleaned}`
    }
    
    return contactNumber // Return original if not a valid format
}

describe('find properties',()=>{
    beforeEach(()=>{
        cy.exception()
        cy.OLX()
    })
    it('find properties for all locations', () => {
        cy.wait(10000)
        cy.get('button#moe-dontallow_button').should('be.visible').click()

        cy.get('.a29e4ea1').find('div._948d9e0a._0c7320c4._371e9918')
        
        // Process each location sequentially using Cypress commands
        cy.wrap(LOCATIONS).each((location, locationIndex) => {
            cy.log(`\n🔍 Processing Location ${locationIndex + 1}/${LOCATIONS.length}: ${location}`)
            
            // Enter location
            cy.get('._9bd90310._8367ea94._49db122c').find('input._3461c3c6._8206e8bf')
                .click({ force: true })
                .clear({ force: true })
                .type(location, { force: true })
                .type('{enter}', { force: true })
            
            // Wait for dropdown to appear
            cy.wait(2000)
            
            // Select location from dropdown - use first word for matching
            const locationFirstWord = location.split(' ')[0]
            cy.get('.c2e8792b._71c3ab35').find('div._22591cd9').find('div._53cb8cc6.f93ed4a6')
                .find('div._948d9e0a._371e9918').find('div.bc4ac8aa')
                .find('span.a1c1940e').contains(locationFirstWord, { matchCase: false })
                .should('be.visible')
                .click({ force: true })

            // Enter property title
            cy.get('._91727253').find('div._948d9e0a._778bb2b9').find('div._4b14156c')
                .find('div._9bd90310._8367ea94').find('input.a91c46cd._8206e8bf')
                .click({ force: true })
                .clear({ force: true })
                .type(PROPERTY_TITLES[0], { force: true })
                .type('{enter}', { force: true })

            // Set price filter
            cy.get('._4532be3c').find('div.a51a78e3').find('span.a1c1940e.b7af14b4').contains('Price').then(() => {
                cy.wait(5000)
                cy.get('._4b14156c').find('div._9bd90310.a64c8c6e._49db122c')
                    .find('input._8206e8bf.dcca86d9').eq(1).scrollIntoView()
                    .should('be.visible')
                    .invoke('removeAttr', 'disabled')
                    .click({ force: true })
                    .clear({ force: true })
                    .type('120000', { force: true })
                    .type('{enter}', { force: true })
                cy.wait(5000)
            })

            // Extract property data
            cy.get('._0272c9dc.cbff116c').find('div._14492788')
                .find('div._948d9e0a._371e9918._95d4067f.e1c7c3d4')
                .find('div._948d9e0a._95d4067f').find('ul._1aad128c.ec65250d')
                .then(($listings) => {
                    // Extract property information from each listing
                    const propertyData = []

                    $listings.find('li').each((index, listing) => {
                        const $listing = Cypress.$(listing)

                        // Extract title
                        const title = $listing.find('h2._1093b649').text().trim()

                        // Extract price
                        const price = $listing.find('span.f83175ac').text().trim()

                        // Extract contact number - must be captured immediately after price
                        const rawContactNumber = $listing.find('span._511f6edc[aria-label="Listing phone number"]').text().trim() || 
                                               $listing.find('div.d7c9511b span._511f6edc').text().trim() ||
                                               $listing.find('span[aria-label="Listing phone number"]').text().trim() ||
                                               'Not available'
                        
                        const contactNumber = cleanContactNumber(rawContactNumber)

                        // Extract location
                        const propertyLocation = $listing.find('span.f047db22[aria-label="Location"]').text().trim()

                        // Extract floor information (if available)
                        const floorInfo = $listing.find('span._3e1113f0').text().trim()

                        // Extract time of upload
                        const uploadTime = $listing.find('span[aria-label="Creation date"]').text().trim()

                        // Extract description (from title or additional details)
                        const description = title || 'No description available'

                        // Extract additional details
                        const bedrooms = $listing.find('span[aria-label="Bedrooms"] ._3e1113f0').text().trim()
                        const bathrooms = $listing.find('span[aria-label="Bathrooms"] ._3e1113f0').text().trim()
                        const area = $listing.find('span[aria-label="Area"] ._3e1113f0').text().trim()

                        // Extract property type from title
                        const propertyType = extractPropertyType(title)

                        // Extract price in numeric format for comparison
                        const priceNumeric = extractNumericPrice(price)

                        // Only add to array if we have at least title and price
                        if (title && price) {
                            const propertyRecord = {
                                // Basic Information
                                title: title,
                                description: description,
                                price: price,
                                priceNumeric: priceNumeric,
                                location: propertyLocation || 'Not specified',
                                propertyType: propertyType,

                                // Contact Information
                                contactNumber: contactNumber,

                                // Property Details
                                floor: floorInfo || 'Not specified',
                                bedrooms: bedrooms || 'Not specified',
                                bathrooms: bathrooms || 'Not specified',
                                area: area || 'Not specified',

                                // Timing Information
                                uploadTime: uploadTime || 'Not specified',

                                // Metadata for Duplication Detection
                                titleHash: generateHash(title),
                                locationHash: generateHash(propertyLocation),
                                priceHash: generateHash(price),
                                contactHash: generateHash(contactNumber),

                                // Extraction Metadata
                                extractedAt: new Date().toISOString(),
                                source: 'OLX Pakistan',
                                searchLocation: location,
                                searchPropertyTitle: PROPERTY_TITLES[0],
                                listingIndex: index + 1
                            }

                            propertyData.push(propertyRecord)
                        }
                    })

                    // Log the extracted data
                    cy.log(`=== EXTRACTED PROPERTY DATA FOR ${location} ===`)
                    cy.log(`Total properties found: ${propertyData.length}`)

                    propertyData.forEach((property, index) => {
                        cy.log(`🏠 Property ${index + 1}:`)
                        cy.log(`   📝 Title: ${property.title}`)
                        cy.log(`   📄 Description: ${property.description}`)
                        cy.log(`   💰 Price: ${property.price} (Numeric: ${property.priceNumeric})`)
                        cy.log(`   📍 Location: ${property.location}`)
                        cy.log(`   📞 Contact: ${property.contactNumber}`)
                        cy.log(`   🏢 Property Type: ${property.propertyType}`)
                        cy.log(`   🏢 Floor: ${property.floor}`)
                        cy.log(`   🛏️ Bedrooms: ${property.bedrooms}`)
                        cy.log(`   🚿 Bathrooms: ${property.bathrooms}`)
                        cy.log(`   📐 Area: ${property.area}`)
                        cy.log(`   ⏰ Upload Time: ${property.uploadTime}`)
                        cy.log(`   🔍 Duplication Hashes: T:${property.titleHash} L:${property.locationHash} P:${property.priceHash} C:${property.contactHash}`)
                        cy.log('   ' + '─'.repeat(60))
                    })

                    // Validate and clean the extracted data
                    const validationResult = validateAndCleanData(propertyData)

                    cy.log('')
                    cy.log('=== DATA VALIDATION RESULTS ===')
                    cy.log(`📊 Total Properties Extracted: ${validationResult.summary.totalInput}`)
                    cy.log(`✅ Valid Properties: ${validationResult.summary.validEntries}`)
                    cy.log(`❌ Invalid Properties: ${validationResult.summary.invalidEntries}`)
                    cy.log(`📈 Validation Rate: ${validationResult.summary.validationRate}`)

                    if (validationResult.validationErrors.length > 0) {
                        cy.log('')
                        cy.log('⚠️ Validation Errors:')
                        validationResult.validationErrors.forEach((error, index) => {
                            cy.log(`   ${index + 1}. Property ${error.index + 1}: ${error.errors.join(', ')}`)
                        })
                    }

                    // Verify we have valid data
                    expect(validationResult.cleanedData.length).to.be.greaterThan(0)

                    // Get current URL and location for database saving
                    cy.url().then((currentUrl) => {
                        const searchLocation = location
                        const sourceUrl = currentUrl

                        cy.log('')
                        cy.log('=== SAVING PROPERTY DATA ===')
                        cy.log(`📍 Search Location: ${searchLocation}`)
                        cy.log(`🔗 Source URL: ${sourceUrl}`)
                        cy.log(`📊 Properties to save: ${validationResult.cleanedData.length}`)

                        // Save properties to location-specific database
                        savePropertyDatabase(validationResult.cleanedData, searchLocation, sourceUrl)
                    })
                })
        })
    })

    it('organize existing files by location', () => {
        cy.log('🗂️ Starting file organization process...')
        
        // Organize existing files into location-specific folders
        organizeFilesByLocation()
        
        cy.log('✅ File organization completed!')
        cy.log('📁 New folder structure:')
        cy.log('   cypress/fixtures/')
        cy.log('   ├── bahria_town_rawalpindi/')
        cy.log('   │   ├── properties.json')
        cy.log('   │   ├── properties.csv')
        cy.log('   │   ├── enhanced.json')
        cy.log('   │   ├── statistics.json')
        cy.log('   │   ├── location_summary.json')
        cy.log('   │   └── historical_*.json')
        cy.log('   ├── pwd_islamabad/')
        cy.log('   │   ├── properties.json')
        cy.log('   │   ├── properties.csv')
        cy.log('   │   ├── enhanced.json')
        cy.log('   │   ├── statistics.json')
        cy.log('   │   ├── location_summary.json')
        cy.log('   │   └── historical_*.json')
        cy.log('   └── islamabad/')
        cy.log('       ├── properties.json')
        cy.log('       ├── properties.csv')
        cy.log('       ├── enhanced.json')
        cy.log('       ├── statistics.json')
        cy.log('       ├── location_summary.json')
        cy.log('       └── historical_*.json')
    })

    it.skip('database operations and data management', () => {
        // This test demonstrates advanced database operations
        cy.log('🗄️ Starting advanced database operations...')
        
        // Load new data from the previous test
        cy.get('@extractedPropertyData').then((newData) => {
            const searchLocation = LOCATIONS[0]
            const sourceUrl = 'https://www.olx.com.pk/property/rent/'
            
            cy.log('📊 Database Summary:')
            cy.log(`   Total Properties: ${newData.length}`)
            cy.log(`   Search Location: ${searchLocation}`)
            cy.log(`   Source URL: ${sourceUrl}`)
            cy.log(`   Properties saved to location-specific files:`)
            cy.log(`   - JSON: ${searchLocation.toLowerCase().replace(/\s+/g, '_')}_properties.json`)
            cy.log(`   - CSV: ${searchLocation.toLowerCase().replace(/\s+/g, '_')}_properties.csv`)
            cy.log(`   - Enhanced: ${searchLocation.toLowerCase().replace(/\s+/g, '_')}_enhanced.json`)
            cy.log(`   - Statistics: ${searchLocation.toLowerCase().replace(/\s+/g, '_')}_statistics.json`)
        })
    })

    it.skip('verify database files are created', () => {
        // This test verifies that database files are created correctly
        cy.log('🔍 Verifying database files...')
        
        const searchLocation = LOCATIONS[0]
        const cleanLocation = searchLocation.toLowerCase().replace(/\s+/g, '_')
        
        // Check if location-specific database file exists
        cy.readFile(`cypress/fixtures/${cleanLocation}_properties.json`, 'utf8').then((data) => {
            expect(data).to.be.an('array')
            expect(data.length).to.be.greaterThan(0)
            cy.log(`✅ Location-specific database file exists: ${cleanLocation}_properties.json`)
            
            // Verify data structure and new fields
            if (data.length > 0) {
                const firstProperty = data[0]
                expect(firstProperty).to.have.property('title')
                expect(firstProperty).to.have.property('price')
                expect(firstProperty).to.have.property('location')
                expect(firstProperty).to.have.property('sourceUrl')
                expect(firstProperty).to.have.property('searchLocation')
                cy.log('✅ Database structure is valid with URL and location data')
            }
        })
        
        // Check if CSV file exists
        cy.readFile(`cypress/fixtures/${cleanLocation}_properties.csv`, 'utf8').then((csvData) => {
            expect(csvData).to.include('Title,Price,Location')
            cy.log(`✅ CSV file exists: ${cleanLocation}_properties.csv`)
        })
        
        // Check if enhanced database exists
        cy.readFile(`cypress/fixtures/${cleanLocation}_enhanced.json`, 'utf8').then((enhancedData) => {
            expect(enhancedData).to.be.an('array')
            if (enhancedData.length > 0) {
                const firstProperty = enhancedData[0]
                expect(firstProperty).to.have.property('id')
                expect(firstProperty).to.have.property('extractedAt')
                expect(firstProperty).to.have.property('sourceUrl')
                cy.log(`✅ Enhanced database exists: ${cleanLocation}_enhanced.json`)
            }
        })
        
        // Check if statistics file exists
        cy.readFile(`cypress/fixtures/${cleanLocation}_statistics.json`, 'utf8').then((stats) => {
            expect(stats).to.have.property('totalProperties')
            expect(stats).to.have.property('priceRanges')
            expect(stats).to.have.property('locations')
            cy.log(`✅ Statistics file exists: ${cleanLocation}_statistics.json`)
        })
    })

})