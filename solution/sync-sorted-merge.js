'use strict'

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

	// If the date from the leftIndex is smaller than date from currentMindIndex, update the currentMinIndex
	if (leftIndex < logSources.length && logSources[leftIndex].last.date < logSources[currentMinIndex].last.date)
		currentMinIndex = leftIndex;
	// If the date from the rightIndex is smaller than date from currentMinIndex, update the currentMinIndex
	if (rightIndex < logSources.length && logSources[rightIndex].last.date < logSources[currentMinIndex].last.date)
		currentMinIndex = rightIndex;

	// If currentMinIndex was changed, then we found a smaller value
	if (currentMinIndex != startIndex) {
		// Swap
		let tmpBuffer = logSources[currentMinIndex];
		logSources[currentMinIndex] = logSources[startIndex];
		logSources[startIndex] = tmpBuffer;

		// Rebuild min-heap structure
		buildMinHeap(logSources, currentMinIndex);
	}
}

/* 	Overview:  			Function to grab the min log entry from the heap structure
* 	@param logSources: 	The collection of Log Sources
*
*/
function popMin(logSources) {
	// Get the min date
	let min = Object.assign({}, logSources[0]);

	// If popped source is drained
	if (!logSources[0].pop()) {
		// Swap with end value and remove it
		logSources[0] = logSources[logSources.length - 1];
		logSources.pop();
	}

	// Rebuild to keep our logSources in min-heap ordering
	if (logSources.length > 1) {
		buildMinHeap(logSources, 0);
	}

	return min.last;
}

module.exports = (logSources, printer) => {

	// Initially sort our logSources to a min-heap ordering
	let index = Math.floor((logSources.length - 1) / 2);
	while (index >= 0) {
		buildMinHeap(logSources, index);
		--index;
	}

	// Print our log entries in order
	while (logSources.length > 0) {
		printer.print(popMin(logSources));
	}
	printer.done();
}

