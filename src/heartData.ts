import fs from "fs";

async function reviseData() {
  let revisedData = {};
  const hdata = await fs.readFileSync(
    process.cwd() + "/inputData/heartrate.json",
    "utf8"
  );
  const jsonData = JSON.parse(hdata);
  for (var i = 0; i < jsonData.length; i++) {
    const dateObj = new Date(jsonData[i].timestamps.startTime);
    const date = await dateObj.toISOString().substr(0, 10);
    if (!(date in revisedData)) {
      revisedData[date] = { heartRate: [], time: [] };
    }
    revisedData[date]["heartRate"].push(jsonData[i].beatsPerMinute);
    revisedData[date]["time"].push(jsonData[i].timestamps.startTime);
  }
  return revisedData;
}

function calculateStatistics(obj: any, key: string) {
  const data = obj[key];
  if (data && data.heartRate.length > 0) {
    const array1 = data.heartRate;
    const min = Math.min(...array1);
    const max = Math.max(...array1);
    const sortedArray = array1.slice().sort((a, b) => a - b);
    const median =
      sortedArray.length % 2 === 0
        ? (sortedArray[sortedArray.length / 2 - 1] +
            sortedArray[sortedArray.length / 2]) /
          2
        : sortedArray[Math.floor(sortedArray.length / 2)];
    const dates = data.time.map((timestamp) => new Date(timestamp));
    const latestTimestamp = new Date(
      Math.max(...dates.map((date) => date.getTime()))
    );

    return { min, max, median, latestTimestamp };
  } else {
    return null;
  }
}

async function printPatientData() {
  let statisticsArray = [];
  let nestedObject = await reviseData();
  // Iterate over the nested object
  for (const key in nestedObject) {
    if (nestedObject.hasOwnProperty(key)) {
      const stats = calculateStatistics(nestedObject, key);
      if (stats) {
        statisticsArray.push({
          min: stats.min,
          max: stats.max,
          median: stats.median,
          latestTimestamp: stats.latestTimestamp.toISOString(),
        });
      } else {
        console.log(`No data available for key: ${key}`);
      }
    }
  }
  let date = new Date();
  statisticsArray.push(date);
  // Convert the statistics array to JSON string
  const jsonStats = JSON.stringify(statisticsArray, null, 2);

  // Write the JSON string to a file
  fs.writeFileSync("statistics.json", jsonStats);

  console.log("Statistics saved to statistics.json");
}

printPatientData();
