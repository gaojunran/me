#!/usr/bin/env node

/**
 * Test script for WakaTime Netlify Function
 * 
 * Usage:
 *   node test-wakatime-function.js [url]
 * 
 * Examples:
 *   node test-wakatime-function.js
 *   node test-wakatime-function.js http://localhost:8888
 *   node test-wakatime-function.js https://your-site.netlify.app
 */

const baseUrl = process.argv[2] || 'http://localhost:8888'

console.log('🧪 Testing WakaTime Netlify Function\n')
console.log(`Base URL: ${baseUrl}\n`)

async function testFunction() {
  const endpoint = `${baseUrl}/.netlify/functions/wakatime?endpoint=users/current/stats/last_7_days`
  
  console.log(`📡 Fetching: ${endpoint}\n`)
  
  try {
    const response = await fetch(endpoint)
    
    console.log(`Status: ${response.status} ${response.statusText}`)
    console.log(`Headers:`)
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`)
    })
    console.log()
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error Response:')
      console.error(errorText)
      process.exit(1)
    }
    
    const data = await response.json()
    
    console.log('✅ Success! Response data:')
    console.log(JSON.stringify(data, null, 2))
    
    // Validate response structure
    if (data.data && data.data.grand_total) {
      console.log('\n📊 Summary:')
      console.log(`  Total time: ${data.data.grand_total.text}`)
      console.log(`  Languages: ${data.data.languages?.length || 0}`)
      console.log(`  Projects: ${data.data.projects?.length || 0}`)
      console.log(`  Editors: ${data.data.editors?.length || 0}`)
      
      if (data.data.languages?.length > 0) {
        console.log('\n  Top Languages:')
        data.data.languages.slice(0, 3).forEach((lang, i) => {
          console.log(`    ${i + 1}. ${lang.name}: ${lang.text} (${lang.percent.toFixed(1)}%)`)
        })
      }
      
      if (data.data.projects?.length > 0) {
        console.log('\n  Top Projects:')
        data.data.projects.slice(0, 3).forEach((project, i) => {
          console.log(`    ${i + 1}. ${project.name}: ${project.text} (${project.percent.toFixed(1)}%)`)
        })
      }
    }
    
    console.log('\n✅ All tests passed!')
  }
  catch (error) {
    console.error('❌ Test failed:')
    console.error(error.message)
    process.exit(1)
  }
}

testFunction()
