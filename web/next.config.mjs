import { config } from "dotenv";

// .env lives at the repo root, one level up from web/ — loaded once here so
// every server component / route handler can read process.env.X directly.
config({ path: "../.env" });

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
