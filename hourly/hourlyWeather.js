const calculateNextWholeHour = (timezoneOffset) => {
    const now = new Date(); // Current UTC time
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000); // Convert to UTC milliseconds
    const localTime = new Date(utc + (1000 * timezoneOffset)); // Convert to local time using timezone offset
    const nextHour = new Date(localTime); // Create a new date object for local time
    nextHour.setMinutes(0); // Reset minutes to 0
    nextHour.setSeconds(0); // Reset seconds to 0
    nextHour.setMilliseconds(0); // Reset milliseconds to 0
    if (nextHour <= localTime) {
        nextHour.setHours(nextHour.getHours() + 1); // Move to the next hour if current hour matches or is in the past
    }
    return nextHour; 
    
};
