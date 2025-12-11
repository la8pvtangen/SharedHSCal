//---------------------------------------------------------
// Utility test function for basic testing functionality
// Provides: test()
//---------------------------------------------------------

/**
 * Simple test function that executes a test case
 * @param {string} description - Description of the test
 * @param {Function} testFn - Test function to execute
 */
export function test(description, testFn) {
    try {
        console.log(`[TEST] Running: ${description}`);
        testFn();
        console.log(`[TEST] ✓ Passed: ${description}`);
        return true;
    } catch (error) {
        console.error(`[TEST] ✗ Failed: ${description}`);
        console.error(`[TEST] Error: ${error.message}`);
        return false;
    }
}
