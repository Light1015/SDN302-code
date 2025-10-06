// app.js
// Comprehensive demo: Basic Auth | Cookies (signed) | Sessions | bcrypt | AES encryption | MFA (TOTP) | JWT
// Run: node app.js
// Dependencies: express cookie-parser express-session bcryptjs jsonwebtoken speakeasy qrcode
// Mapping to slides: Basic Auth & Cookies (pptx), Bcrypt (pdf), Sessions/Passport (pdf), JWT (pdf).
//   Basic Auth & Cookies: see slides. :contentReference[oaicite:0]{index=0}
//   Bcrypt hashing: see slides. :contentReference[oaicite:1]{index=1}
//   Sessions / Passport notes: see slides. :contentReference[oaicite:2]{index=2}
//   JWT / Token-based: see slides. :contentReference[oaicite:3]{index=3}

const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// -----------------------
// CONFIG / MIDDLEWARE
// -----------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie-parser with secret -> supports signed cookies
app.use(cookieParser('demo_cookie_secret')); // signed cookie secret

// express-session for session-based auth (demo: in-memory store; production: use Redis/Mongo store)
app.use(session({
    name: 'sid',                 // session cookie name
    secret: 'demo_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,            // mitigate XSS
        secure: false,             // set true if using HTTPS
        sameSite: 'lax',
        maxAge: 30_000             // 30s for demo to show timeout
    }
}));

// Simple in-memory "DB" for demo
const USERS = [
    // sample user (pre-hashed for demo registration path below)
    // will be filled by /register
];

// Helper: find user by email
function findUser(email) {
    return USERS.find(u => u.email === (email || '').toLowerCase());
}

// -----------------------
// SECTION 1 — BASIC AUTH (HTTP Basic Access Authentication)
// Mapping & notes: Basic Auth requires Authorization header "Basic <base64(user:pass)>".
// Slides: Basic Access Authentication description & Authorization header format. :contentReference[oaicite:4]{index=4}
// -----------------------
app.get('/basic', (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Demo Basic"');
        return res.status(401).send('Authentication required (Basic).');
    }
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Basic') {
        res.setHeader('WWW-Authenticate', 'Basic realm="Demo Basic"');
        return res.status(401).send('Malformed Authorization header.');
    }
    const decoded = Buffer.from(parts[1], 'base64').toString('utf8');
    const [username, password] = decoded.split(':');
    // demo credential = admin:123456
    if (username === 'admin' && password === '123456') {
        return res.send('Basic Auth success — welcome admin.');
    }
    res.setHeader('WWW-Authenticate', 'Basic realm="Demo Basic"');
    return res.status(401).send('Invalid credentials.');
});

// -----------------------
// SECTION 2 — COOKIES (set, read, signed)
// Slides describe how cookies work, HttpOnly, Secure, SameSite and signed cookies. :contentReference[oaicite:5]{index=5}
// -----------------------
// POST /set-cookie  => sets normal cookie + signed cookie
app.post('/set-cookie', (req, res) => {
    res.cookie('normalUser', 'StudentA', { maxAge: 60_000 }); // readable by JS
    res.cookie('signedUser', 'SecureStudent', { signed: true, httpOnly: true, maxAge: 60_000 });
    res.cookie('samesiteNone', 'ok', { sameSite: 'None', secure: false }); // for illustration
    res.json({ ok: true, message: 'Cookies set: normalUser, signedUser (httpOnly & signed).' });
});

// GET /read-cookie -> shows cookies parsed by cookie-parser
app.get('/read-cookie', (req, res) => {
    res.json({
        cookies: req.cookies,           // normal cookies
        signedCookies: req.signedCookies // signed cookies (verified)
    });
});

// GET /clear-cookie -> clear both cookies
app.get('/clear-cookie', (req, res) => {
    res.clearCookie('normalUser');
    res.clearCookie('signedUser');
    res.send('Cookies cleared.');
});

// -----------------------
// SECTION 3 — PASSWORD AUTH (bcrypt) + SESSION LOGIN
// Slides: Hashing passwords with bcrypt (use bcrypt.compare when login). :contentReference[oaicite:6]{index=6}
// -----------------------

// POST /register { email, password } - demo registers and hashes password using bcrypt
app.post('/register', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });

    if (findUser(email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('[REGISTER]', email, '=> bcrypt hash =', hash);

    const user = { id: USERS.length + 1, email: email.toLowerCase(), hash, role: 'user', otpSecret: null };
    USERS.push(user);

    res.status(201).json({ message: 'Registered (bcrypt hash saved).', email: user.email });
});


// POST /login-session { email, password } -> create server session if ok
app.post('/login-session', async (req, res) => {
    const { email, password } = req.body || {};
    const user = findUser(email);
    if (!user) return res.status(400).json({ error: 'Invalid email/password' });

    const ok = await bcrypt.compare(password, user.hash); // use bcrypt.compare
    if (!ok) return res.status(401).json({ error: 'Invalid email/password' });

    // Save minimal info in session
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.role = user.role;
    req.session.createdAt = Date.now();

    res.json({ message: 'Session login OK. Use /dashboard to verify.' });
});

// GET /dashboard - protected by session
app.get('/dashboard', (req, res) => {
    if (!req.session || !req.session.userId) return res.status(401).send('Not logged in or session expired.');
    const ageSec = Math.floor((Date.now() - req.session.createdAt) / 1000);
    res.send(`Dashboard — Hello ${req.session.email} (session age: ${ageSec}s)`);
});

// GET /logout - destroy session
app.get('/logout', (req, res) => {
    if (!req.session) return res.send('No session.');
    req.session.destroy(err => {
        if (err) return res.status(500).send('Error destroying session.');
        res.clearCookie('sid'); // remove cookie client-side
        res.send('Logged out; session destroyed.');
    });
});

// GET /session-info - debug: shows session & cookies
app.get('/session-info', (req, res) => {
    res.json({ sessionID: req.sessionID, session: req.session || null, cookies: req.cookies, signedCookies: req.signedCookies });
});

// -----------------------
// SECTION 4 — TOKEN-BASED (JWT)
// Slides: JWT structure + sign/verify; use short expires + refresh token in practice. :contentReference[oaicite:7]{index=7}
// -----------------------
const JWT_SECRET = process.env.JWT_SECRET || 'demo_jwt_secret';

// POST /login-jwt { email, password } -> return access token (JWT)
app.post('/login-jwt', async (req, res) => {
    const { email, password } = req.body || {};
    const user = findUser(email);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '5m' }); // short for demo
    res.json({ token, expiresIn: '5m' });
});

// Middleware to verify Bearer token
function verifyJwt(req, res, next) {
    const auth = req.headers.authorization || '';
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Missing token' });
    const token = parts[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userJwt = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// GET /profile-jwt -> protected by JWT
app.get('/profile-jwt', verifyJwt, (req, res) => {
    res.json({ message: 'JWT protected profile', user: req.userJwt });
});

// -----------------------
// SECTION 5 — MFA: TOTP (speakeasy) demo (Google Authenticator)
// Slides mention MFA as recommended. Use a TOTP library for demo.
// -----------------------
/*
  Flow:
  1) GET /mfa/setup/:email  -> generates secret + returns QR (for scanning by GA)
  2) POST /mfa/verify      -> body { email, token } -> verify TOTP
*/
app.get('/mfa/setup/:email', async (req, res) => {
    const email = req.params.email;
    let user = findUser(email);
    if (!user) return res.status(404).send('User not found (register first).');

    const secret = speakeasy.generateSecret({ name: `SDN302 (${email})` });
    user.otpSecret = secret.base32;
    // return QR code image so student can scan with Authenticator app
    const otpauth = secret.otpauth_url;
    const dataUrl = await qrcode.toDataURL(otpauth);
    res.send(`<h3>Scan this QR in Google Authenticator / Authy</h3><img src="${dataUrl}" /><p>Or use secret: <b>${secret.base32}</b></p>`);
});

app.post('/mfa/verify', (req, res) => {
    const { email, token } = req.body || {};
    const user = findUser(email);
    if (!user || !user.otpSecret) return res.status(400).json({ error: 'No OTP configured for user' });

    const verified = speakeasy.totp.verify({
        secret: user.otpSecret,
        encoding: 'base32',
        token,
        window: 1
    });
    if (verified) return res.json({ verified: true, message: 'TOTP verified' });
    return res.status(400).json({ verified: false, message: 'Invalid token' });
});

// -----------------------
// SECTION 6 — SIMPLE AES ENCRYPTION (database encryption demo)
// Slides recommend DB encryption for sensitive fields. This demo shows symmetric AES-256-CBC encrypt/decrypt.
// -----------------------
const ENC_ALGO = 'aes-256-cbc';
const ENC_KEY = crypto.scryptSync(process.env.ENC_KEY || 'demo_enc_passphrase', 'salt', 32);
const ENC_IV = Buffer.alloc(16, 0);

function aesEncrypt(text) {
    const cipher = crypto.createCipheriv(ENC_ALGO, ENC_KEY, ENC_IV);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
function aesDecrypt(hex) {
    const decipher = crypto.createDecipheriv(ENC_ALGO, ENC_KEY, ENC_IV);
    let out = decipher.update(hex, 'hex', 'utf8');
    out += decipher.final('utf8');
    return out;
}

app.post('/encrypt', (req, res) => {
    const { plaintext } = req.body || {};
    if (!plaintext) return res.status(400).json({ error: 'plaintext required' });
    const encrypted = aesEncrypt(plaintext);
    res.json({ encrypted });
});
app.post('/decrypt', (req, res) => {
    const { encrypted } = req.body || {};
    if (!encrypted) return res.status(400).json({ error: 'encrypted required' });
    try {
        const plaintext = aesDecrypt(encrypted);
        res.json({ plaintext });
    } catch (err) {
        res.status(400).json({ error: 'Invalid encrypted data' });
    }
});

// -----------------------
// SECTION 7 — OPTIONAL: Minimal Passport-like note (not full Passport setup)
// Slides recommend using Passport + passport-local-mongoose for full apps (Mongoose). For demo we used session + bcrypt.
// If you want a Passport example with Mongo/Mongoose see slides. :contentReference[oaicite:8]{index=8}
// -----------------------

// -----------------------
// START SERVER
// -----------------------
app.listen(PORT, () => {
    console.log(`Demo server listening: http://localhost:${PORT}`);
    console.log('Endpoints: /basic /set-cookie /read-cookie /clear-cookie /register /login-session /dashboard /logout /session-info /login-jwt /profile-jwt /mfa/setup/:email /mfa/verify /encrypt /decrypt');
});
