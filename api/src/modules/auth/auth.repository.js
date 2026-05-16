const { pool } = require('../../database/db');

const findUserByIdentifier = async (identifier) => {
  const [rows] = await pool.query(
    `SELECT
      u.id, u.uuid, u.company_id, u.role_id,
      u.first_name, u.last_name, u.email, u.phone, u.username,
      u.password, u.avatar, u.status,
      u.email_verified_at, u.last_login_at, u.last_login_ip,
      u.login_attempts, u.locked_until, u.password_changed_at,
      u.created_at, u.updated_at,
      r.name AS role_name, r.slug AS role_slug,
      c.name AS company_name, c.uuid AS company_uuid,
      c.subscription_status, c.status AS company_status,
      c.is_verified AS company_verified
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN companies c ON u.company_id = c.id
    WHERE (u.email = ? OR u.username = ?)
      AND u.deleted_at IS NULL
    LIMIT 1`,
    [identifier, identifier]
  );
  return rows[0] || null;
};

const findUserByUuid = async (uuid) => {
  const [rows] = await pool.query(
    `SELECT
      u.id, u.uuid, u.company_id, u.role_id,
      u.first_name, u.last_name, u.email, u.phone, u.username,
      u.avatar, u.status,
      u.email_verified_at, u.last_login_at, u.last_login_ip,
      u.password_changed_at, u.created_at, u.updated_at,
      r.name AS role_name, r.slug AS role_slug,
      c.name AS company_name, c.uuid AS company_uuid,
      c.subscription_status, c.status AS company_status,
      c.is_verified AS company_verified
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN companies c ON u.company_id = c.id
    WHERE u.uuid = ? AND u.deleted_at IS NULL
    LIMIT 1`,
    [uuid]
  );
  return rows[0] || null;
};

const findUserById = async (id) => {
  const [rows] = await pool.query(
    `SELECT
      u.id, u.uuid, u.company_id, u.role_id,
      u.first_name, u.last_name, u.email, u.phone, u.username,
      u.avatar, u.status,
      u.email_verified_at, u.last_login_at, u.last_login_ip,
      u.password_changed_at, u.created_at, u.updated_at,
      r.name AS role_name, r.slug AS role_slug,
      c.name AS company_name, c.uuid AS company_uuid,
      c.subscription_status, c.status AS company_status,
      c.is_verified AS company_verified
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN companies c ON u.company_id = c.id
    WHERE u.id = ? AND u.deleted_at IS NULL
    LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const getUserPermissions = async (roleId) => {
  const [rows] = await pool.query(
    `SELECT p.slug, p.name, p.group
    FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    WHERE rp.role_id = ?
    ORDER BY p.group, p.name`,
    [roleId]
  );
  return rows;
};

const updateLastLogin = async (userId, ip) => {
  await pool.query(
    `UPDATE users
    SET last_login_at = CURRENT_TIMESTAMP,
        last_login_ip = ?,
        login_attempts = 0,
        locked_until = NULL
    WHERE id = ?`,
    [ip, userId]
  );
};

const incrementLoginAttempts = async (userId) => {
  await pool.query(
    `UPDATE users
    SET login_attempts = login_attempts + 1
    WHERE id = ?`,
    [userId]
  );
};

const lockUserAccount = async (userId, minutes) => {
  await pool.query(
    `UPDATE users
    SET locked_until = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? MINUTE)
    WHERE id = ?`,
    [minutes, userId]
  );
};

const updatePassword = async (userId, hashedPassword) => {
  await pool.query(
    `UPDATE users
    SET password = ?, password_changed_at = CURRENT_TIMESTAMP, remember_token = NULL
    WHERE id = ?`,
    [hashedPassword, userId]
  );
};

const storeResetToken = async (userId, hashedToken, expiresAt) => {
  await pool.query(
    `UPDATE users
    SET remember_token = ?, password_changed_at = ?
    WHERE id = ?`,
    [hashedToken, expiresAt, userId]
  );
};

const findUserByResetToken = async (hashedToken) => {
  const [rows] = await pool.query(
    `SELECT id, uuid, email, first_name, last_name, remember_token
    FROM users
    WHERE remember_token = ? AND deleted_at IS NULL
      AND password_changed_at IS NOT NULL
      AND password_changed_at > CURRENT_TIMESTAMP
    LIMIT 1`,
    [hashedToken]
  );
  return rows[0] || null;
};

const clearResetToken = async (userId) => {
  await pool.query(
    `UPDATE users
    SET remember_token = NULL, password_changed_at = NULL
    WHERE id = ?`,
    [userId]
  );
};

module.exports = {
  findUserByIdentifier,
  findUserByUuid,
  findUserById,
  getUserPermissions,
  updateLastLogin,
  incrementLoginAttempts,
  lockUserAccount,
  updatePassword,
  storeResetToken,
  findUserByResetToken,
  clearResetToken
};
