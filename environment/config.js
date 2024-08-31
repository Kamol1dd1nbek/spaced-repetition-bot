import dotenv from "dotenv";

const envFile =
  process.argv[2] === "production" ? "production.env" : "development.env";
const result = dotenv.config({ path: `./environment/${envFile}` });

if (result.error) {
  console.log(result.error.message);
  process.exit(1);
}

export default process.env;
