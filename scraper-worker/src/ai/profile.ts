import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const here = dirname(fileURLToPath(import.meta.url));
const profilePath = join(here, "..", "..", "profile.md");

let cachedProfile: string | null = null;

export function getProfile(): string {
  if (cachedProfile === null) {
    cachedProfile = readFileSync(profilePath, "utf-8");
  }
  return cachedProfile;
}
