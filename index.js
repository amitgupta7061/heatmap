import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";

const path = "./data.json";

// Generate 100 random dates for 2024
const generateRandomDates = (count) => {
  const dates = [];
  const startDate = moment("2024-01-01");
  const endDate = moment("2024-12-31");

  for (let i = 0; i < count; i++) {
    const randomDate = moment(startDate).add(
      Math.floor(Math.random() * endDate.diff(startDate, "days")),
      "days"
    );
    dates.push(randomDate.format("YYYY-MM-DD"));
  }

  return [...new Set(dates)].sort(); // Remove duplicates and sort
};

// Define your specific dates (using your existing dates)
const commitDates = [...generateRandomDates(100)];

const getRandomCommitCount = () => Math.floor(Math.random() * 3) + 1;

const makeCommitForTime = async (date, commitNumber) => {
  // Add random hours and minutes to spread commits throughout the day
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  const commitDate = date.clone().add(hours, "hours").add(minutes, "minutes");

  const data = {
    date: commitDate.format(),
    message: `Commit ${commitNumber} for ${commitDate.format("YYYY-MM-DD")}`,
    timestamp: commitDate.valueOf(),
  };

  console.log(`Creating commit ${commitNumber} for: ${commitDate.format()}`);

  await jsonfile.writeFile(path, data, { spaces: 2 });
  await simpleGit()
    .add([path])
    .commit(`Update ${commitNumber} for ${commitDate.format("YYYY-MM-DD")}`, {
      "--date": commitDate.format(),
    });
};

const makeCommits = async (dates) => {
  if (dates.length === 0) {
    console.log("All commits completed");
    return simpleGit().push();
  }

  const currentDate = moment();
  const date = moment(dates[0]);

  // Skip if date is in the future
  if (date.isAfter(currentDate)) {
    console.log(`Skipping future date: ${date.format()}`);
    return makeCommits(dates.slice(1));
  }

  try {
    const commitsForDay = getRandomCommitCount();
    console.log(
      `Making ${commitsForDay} commits for ${date.format("YYYY-MM-DD")}`
    );

    for (let i = 1; i <= commitsForDay; i++) {
      await makeCommitForTime(date, i);
      // Use Promise with setTimeout for better async handling
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return makeCommits(dates.slice(1));
  } catch (error) {
    console.error("Error creating commit:", error);
    return makeCommits(dates.slice(1)); // Continue with next date even if error occurs
  }
};

// Start the commit process
makeCommits(commitDates)
  .then(() => {
    console.log("Commit process completed");
  })
  .catch((error) => {
    console.error("Process failed:", error);
  });
