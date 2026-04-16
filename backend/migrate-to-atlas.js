/**
 * migrate-to-atlas.js
 * Run with: mongosh migrate-to-atlas.js
 *
 * Transfers all collections from local campus_placement DB to MongoDB Atlas.
 * Safe to re-run — uses upsert so no duplicates are created.
 */

const ATLAS_URI = "mongodb+srv://12345:12345@cluster0.02hkiwo.mongodb.net/campus_placement?retryWrites=true&w=majority&appName=Cluster0";
const LOCAL_URI  = "mongodb://localhost:27017/campus_placement";
const DB_NAME    = "campus_placement";

print("=== Campus Placement Portal — Atlas Migration ===\n");

// ── Connect to local ──────────────────────────────────────────────────────────
print("Connecting to local MongoDB...");
const localConn = new Mongo(LOCAL_URI);
const localDb   = localConn.getDB(DB_NAME);
print("✓ Connected to local\n");

// ── Connect to Atlas ──────────────────────────────────────────────────────────
print("Connecting to MongoDB Atlas...");
const atlasConn = new Mongo(ATLAS_URI);
const atlasDb   = atlasConn.getDB(DB_NAME);
print("✓ Connected to Atlas\n");

// ── Migrate each collection ───────────────────────────────────────────────────
const collections = localDb.getCollectionNames();
print(`Found ${collections.length} collections to migrate: ${collections.join(", ")}\n`);

let totalMigrated = 0;
let totalSkipped  = 0;

collections.forEach(collName => {
    const localColl = localDb.getCollection(collName);
    const atlasColl = atlasDb.getCollection(collName);

    const docs = localColl.find({}).toArray();
    if (docs.length === 0) {
        print(`  [SKIP] ${collName} — empty`);
        return;
    }

    let inserted = 0;
    let skipped  = 0;

    docs.forEach(doc => {
        const existing = atlasColl.findOne({ _id: doc._id });
        if (existing) {
            skipped++;
        } else {
            atlasColl.insertOne(doc);
            inserted++;
        }
    });

    print(`  [OK]   ${collName} — ${inserted} inserted, ${skipped} already existed`);
    totalMigrated += inserted;
    totalSkipped  += skipped;
});

// ── Recreate indexes ──────────────────────────────────────────────────────────
print("\nRecreating indexes on Atlas...");

atlasDb.users.createIndex({ email: 1 }, { unique: true });
atlasDb.users.createIndex({ rollNumber: 1, collegeId: 1 });
print("  ✓ users: email (unique), rollNumber+collegeId");

atlasDb.colleges.createIndex({ allowedDomains: 1 });
print("  ✓ colleges: allowedDomains");

atlasDb.jobs.createIndex({ status: 1, deadline: -1 });
atlasDb.jobs.createIndex({ postedBy: 1 });
print("  ✓ jobs: status+deadline, postedBy");

atlasDb.applications.createIndex({ jobId: 1, studentId: 1 }, { unique: true });
atlasDb.applications.createIndex({ studentId: 1 });
print("  ✓ applications: jobId+studentId (unique), studentId");

atlasDb.placement_drives.createIndex({ status: 1 });
print("  ✓ placement_drives: status");

atlasDb.placement_applications.createIndex({ driveId: 1, studentId: 1 }, { unique: true, sparse: true });
print("  ✓ placement_applications: driveId+studentId (unique, sparse)");

atlasDb.interview_sessions.createIndex({ studentId: 1, createdAt: -1 });
print("  ✓ interview_sessions: studentId+createdAt");

atlasDb.student_profiles.createIndex({ userId: 1 }, { unique: true });
print("  ✓ student_profiles: userId (unique)");

atlasDb.notifications.createIndex({ userId: 1, createdAt: -1 });
print("  ✓ notifications: userId+createdAt");

// ── Validation ────────────────────────────────────────────────────────────────
print("\n=== Validation ===");
let allMatch = true;
collections.forEach(collName => {
    const localCount = localDb.getCollection(collName).countDocuments();
    const atlasCount = atlasDb.getCollection(collName).countDocuments();
    const match = atlasCount >= localCount;
    if (!match) allMatch = false;
    print(`  ${match ? "✓" : "✗"} ${collName}: local=${localCount}, atlas=${atlasCount}`);
});

print(`\n=== Summary ===`);
print(`  Newly migrated : ${totalMigrated} documents`);
print(`  Already on Atlas: ${totalSkipped} documents`);
print(`  All counts match: ${allMatch ? "YES ✓" : "NO ✗ — check above"}`);
print("\nMigration complete.");
