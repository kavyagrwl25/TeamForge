import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "../src/constants.js";
import { Project } from "../src/models/project.model.js";
import { Request } from "../src/models/request.model.js";
import { User } from "../src/models/user.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const [, , projectIdArg, countArg] = process.argv;

const printUsageAndExit = (message) => {
  console.error(message);
  console.error("Usage: node scripts/seedRequests.js <projectId> <count>");
  process.exit(1);
};

const buildFakeUser = (index) => {
  const uniqueSeed = `${Date.now()}-${index}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  return {
    fullName: `Pagination Test User ${index + 1}`,
    userName: `pagination_user_${uniqueSeed}`.toLowerCase(),
    email: `pagination_user_${uniqueSeed}@example.com`.toLowerCase(),
    password: "seedpass123",
    bio: "Seeded user for request pagination testing",
    skills: ["React", "Node.js"],
  };
};

const main = async () => {
  if (!projectIdArg) {
    printUsageAndExit("Project id is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(projectIdArg)) {
    printUsageAndExit("Project id must be a valid MongoDB ObjectId.");
  }

  const count = Number.parseInt(countArg, 10);

  if (!Number.isInteger(count) || count <= 0) {
    printUsageAndExit("Count must be a positive integer.");
  }

  if (!process.env.MONGO_URI) {
    printUsageAndExit("MONGO_URI is missing in Backend/.env.");
  }

  let createdUsersCount = 0;
  let createdRequestsCount = 0;

  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log("MongoDB connected successfully");

    const project = await Project.findById(projectIdArg).lean();

    if (!project) {
      throw new Error(`Project not found for id ${projectIdArg}`);
    }

    const fakeUsers = Array.from({ length: count }, (_, index) =>
      buildFakeUser(index)
    );

    const createdUsers = await User.create(fakeUsers);
    createdUsersCount = createdUsers.length;

    const requestDocs = createdUsers.map((user) => ({
      requestedBy: user._id,
      project: project._id,
      roleRequested: "Frontend Developer",
      pitchMessage: "This is a test request for pagination",
      status: "pending",
    }));

    const createdRequests = await Request.insertMany(requestDocs, {
      ordered: false,
    });
    createdRequestsCount = createdRequests.length;

    console.log(`Project: ${project._id}`);
    console.log(`Users created: ${createdUsersCount}`);
    console.log(`Requests created: ${createdRequestsCount}`);
  } catch (error) {
    if (error?.name === "MongoBulkWriteError" && Array.isArray(error.writeErrors)) {
      const duplicateErrors = error.writeErrors.filter(
        (writeError) => writeError.code === 11000
      );

      if (duplicateErrors.length > 0) {
        console.warn(
          `Skipped ${duplicateErrors.length} duplicate request inserts while seeding.`
        );
        console.log(`Users created: ${createdUsersCount}`);
        console.log(
          `Requests created: ${Math.max(0, createdUsersCount - duplicateErrors.length)}`
        );
        return;
      }
    }

    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

main();
