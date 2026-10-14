
import {
  hashPassword,
  verifyPassword,
} from "../utils/password.js";

async function main(): Promise<void> {
  const password = "Temporary-Test-Password-123!";

  const passwordHash = await hashPassword(password);

  console.log(
    "Hash generated:",
    passwordHash.startsWith("$2"),
  );

  console.log(
    "Correct password:",
    await verifyPassword(password, passwordHash),
  );

  console.log(
    "Wrong password:",
    await verifyPassword("Wrong-Password-456!", passwordHash),
  );

  const anotherHash = await hashPassword(password);

  console.log(
    "Hashes are different:",
    passwordHash !== anotherHash,
  );
}

main().catch((error: unknown) => {
  console.error("Password test failed:", error);
  process.exitCode = 1;
});
