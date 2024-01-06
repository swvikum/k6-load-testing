//random number in range
export const randomIntBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

//get random item in array
export const PickRandomItemInArray = items => {
    var max = items.length;
    var randNum = Math.floor(Math.random() * max) + 1;
    return items[randNum - 1];
};

//random alphanumeric string
export function GetRandomString() {
    return (Math.random() + 1).toString(36).substring(8);
};

//ex: date after 30 days 2023-10-06T12:00:00
export function getDateFromInteger(integer) {
    const currentDate = new Date();
    const newDate = new Date(currentDate.getTime() + integer * 24 * 60 * 60 * 1000);
    // Format the date in YYYY-MM-DDTHH:mm:ss format
    return newDate.toISOString().split('.')[0];
}

// Return Current DateTime in ISO 8601 format:"2023-07-27T01:54:17.735Z
export function currentDateTime() {
    const currentDate = new Date();
    const isoTimestamp = currentDate.toISOString();
    return isoTimestamp
}

//ex: return saturday after stated days
export function nextDateTime(dayOfWeek, daysAfter) {
    var now = new Date();
    now.setDate(now.getDate() + daysAfter);
    now.setDate(now.getDate() + (dayOfWeek + (7 - now.getDay())) % 7);
    return now.toISOString()
}

//ex: return saturday after stated days
export function nextDate(dayOfWeek, daysAfter) {
    var now = new Date();
    now.setDate(now.getDate() + daysAfter);
    now.setDate(now.getDate() + (dayOfWeek + (7 - now.getDay())) % 7);
    return now.toISOString().slice(0, 10);
}

// get date in the format YYYYMMDD
export function formatDate() {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    var h = date.getHours();
    var min = date.getMinutes();
    var dateString = y + (m <= 9 ? '0' + m : m) + (d <= 9 ? '0' + d : d) + h + min;
    return dateString;
}

/*
 * Function to setup the ramping profile for the test.
 * Ramp defaults to 2000ms HTTP response thresholds.
 */
export function setup_ramp(target, duration, loadName) {

    //TODO: check if these 2 env variables are set, if not provide a nice error
    if (!target.length || !duration.length) {
        fail("Need DURATION and TARGET")
    }

    let stagesForRamp = [];
    for (var i = 0; i < duration.length; i++) {
        stagesForRamp.push({duration: duration[i], target: target[i]})
    }

    return {
        stages: stagesForRamp,
        gracefulRampDown: '1m',
        ext: {
            loadimpact: {
                projectID: 3546388,
                // Test runs with the same name groups test runs together
                name: loadName
            }
        },
        thresholds: {
            //TODO: provide an overload for the duration default
            http_req_duration: [`p(99)<2000`] // 99% of requests must complete below 2s
        }
    };
}

/*
 * Returns the base API URL for the environment
 */
export function getBaseUrl(isLocal, environment, tenant, application) {
    return isLocal ? `http://localhost:3125/${application}/local/${tenant}` : `https://api.${environment}.com/graphql`
}

/**
 * random number in range
 */
export const GetRandomIntInRange = max => {
    return Math.floor(Math.random() * Math.floor(max));
};

/*
 * Function used to obtain the target tenant for a test - defaults to 'bv'
 */
export function getTenant() {
    if (__ENV.TENANT) {
        const tenantVar = __ENV.TENANT
        if (tenantVar !== 'bv' && tenantVar !== 'afl' && tenantVar !== 'ca')
            throw 'Tenant is only allowed to be one of bv, afl or ca';
        return tenantVar;
    } else return 'bv'
}