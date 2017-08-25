'use strict'

const P = require('bluebird')

/*	Overview: 			Function to sort the given source into a min-heap structure
*	@param logSources: 	The collection of Log Sources
*	@param startIndex: 	The index of the logSources to perform comparison
*
*/
function buildMinHeap(logSources, startIndex) {
	// Get the left and right indexes
	let leftIndex = 2*startIndex + 1;
	let rightIndex = 2*startIndex + 2;
	let currentMinIndex = startIndex;

	// If the date from the leftIndex is smaller than date from currentMinIndex, update the currentMinIndex
	if (leftIndex < logSources.length && logSources[leftIndex].last.date < logSources[currentMinIndex].last.date)
		currentMinIndex = leftIndex;
	// If the date from the rightIndex is smaller than date from currentMinIndex, update the currentMinIndex
	if (rightIndex < logSources.length && logSources[rightIndex].last.date < logSources[currentMinIndex].last.date)
		currentMinIndex = rightIndex;

	// If currentMinIndex was changed, then we found a smaller value
	if (currentMinIndex != startIndex) {
		// Swap values
		let tmpBuffer = logSources[currentMinIndex];
		logSources[currentMinIndex] = logSources[startIndex];
		logSources[startIndex] = tmpBuffer;

		// Rebuild the min-heap structure
		buildMinHeap(logSources, currentMinIndex);
	}
}

/* 	Overview:  			Function to grab the min log entry from the heap structure
* 	@param logSources: 	The collection of Log Sources
*
*/
function popMin (logSources) {
	// Get the min date
	let min = Object.assign({}, logSources[0]);

	// Resolve the promise from the async pop
	let result = Promise.resolve(logSources[0].popAsync()).then((res) => {
		// If source is drained
		if (res === false) {
			// Swap with end value and pop
			logSources[0] = logSources[logSources.length - 1];
			logSources.pop();
		}
		// Rebuild the min-heap
		if (logSources.length > 1) {
			buildMinHeap(logSources, 0);
		}

		// Return a promise that resolves to our min date
		return new Promise((resolve, reject) => {resolve(min.last)});
	})
	.catch (error => {
		console.log(error);
	});

	return result;
}

module.exports = (logSources, printer) => {
	
	// Initially sort our logSources to a min-heap ordering
	let index = Math.floor((logSources.length - 1) / 2);
	while (index >= 0) {
		buildMinHeap(logSources, index);
		--index;
	}

	// Size checking function, to indicate if we should proceed
	//let logSize = 0;
	let sizeCheck = P.method(logSources => {
		//logSize = logSources.length;
		return logSources.length;
	});

	/* 	Overview:  			Function to simulate a loop for async method calls and resolution
	* 	@param returnSize: 	The size which discontinues the loop 	
	*	@param logSources: 	The collection of Log Sources
	*/
	let resolveLogs =  (returnSize, logSources) => {
		return Promise.resolve(popMin(logSources)).then(logEntry => {
			printer.print(logEntry);
			return sizeCheck(logSources).then(result => {
				if (result > returnSize) return resolveLogs(returnSize, logSources);
			});
		})
		.catch(error => {
			console.log(error);
		});
	}
	
	// Usage for the resolveLogs function
	resolveLogs(0, logSources).then(() => {
		// Finished, print the stats of the run
		printer.done();
	});
}