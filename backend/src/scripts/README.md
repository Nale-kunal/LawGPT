# User Password Diagnostic Script

## Purpose
This script checks all users in the database to identify any users with invalid or missing password hashes.

## Usage

```bash
# From the backend directory
node src/scripts/check-user-passwords.js
```

## What it does
- Connects to MongoDB
- Scans all users in the database
- Checks if each user has a valid password hash
- Reports:
  - Users with valid password hashes
  - Users with invalid password hash formats
  - Users without password hashes

## Output
The script will display:
- A list of all users and their password hash status
- A summary with counts of valid/invalid/missing password hashes
- Recommendations for fixing issues

## Fixing Issues
If users have invalid or missing password hashes:
1. They won't be able to log in with their current passwords
2. They should use the "Forgot Password" feature to reset their passwords
3. Alternatively, an admin can manually reset passwords through the database

## Environment Variables
Make sure your `.env` file has the correct `MONGODB_URI` set, or the script will use the default: `mongodb://localhost:27017/lawyer_zen`





