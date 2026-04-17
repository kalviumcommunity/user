// mappers/response-mappers.js
// Safe user shapes for auth responses.
// Rule: never return a raw DB row. Always use one of these.

/**
 * toAuthUser — Minimum identity for signup and login responses.
 * Contains only what the frontend needs to initialise a session.
 */
const toAuthUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.created_at
})

/**
 * toProfileUser — Extended identity for GET /me.
 * Includes UI-relevant context fields. Still no sensitive data.
 */
const toProfileUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  subscriptionPlan: user.subscription_plan,
  createdAt: user.created_at,
  updatedAt: user.updated_at
})

module.exports = { toAuthUser, toProfileUser }
