use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use hmac::{Hmac, Mac};
use rand::RngCore;
use scrypt::{scrypt, Params};
use sha2::Sha256;
use subtle::ConstantTimeEq;
use unicode_normalization::UnicodeNormalization;

type HmacSha256 = Hmac<Sha256>;

/// Hash a password in `better-auth` scrypt format (`<32-char-hex-salt>:<128-char-hex-key>`).
pub fn hash_password(password: &str) -> Result<String, String> {
    let mut salt_bytes = [0u8; 16];
    rand::thread_rng().fill_bytes(&mut salt_bytes);
    let salt_hex = hex::encode(salt_bytes);

    let params = Params::new(14, 16, 1, 64).map_err(|e| format!("Invalid scrypt params: {e}"))?;

    let normalized: String = password.nfkc().collect();
    let mut derived = [0u8; 64];

    scrypt(normalized.as_bytes(), salt_hex.as_bytes(), &params, &mut derived)
        .map_err(|e| format!("Scrypt failed: {e}"))?;

    Ok(format!("{salt_hex}:{}", hex::encode(derived)))
}

/// Verify a password against a `better-auth` scrypt hash (`<32-char-hex-salt>:<128-char-hex-key>`).
/// Matches `@better-auth/utils/password`: NFKC-normalized password, `N=16384, r=16, p=1, dkLen=64`.
pub fn verify_password(stored_hash: &str, password: &str) -> Result<bool, String> {
    let (salt_hex, key_hex) = stored_hash
        .split_once(':')
        .ok_or_else(|| "Invalid password hash format".to_string())?;

    if salt_hex.is_empty() || key_hex.is_empty() {
        return Err("Invalid password hash format".to_string());
    }

    let expected_key =
        hex::decode(key_hex).map_err(|e| format!("Invalid stored key hex: {e}"))?;

    let params = Params::new(14, 16, 1, expected_key.len())
        .map_err(|e| format!("Invalid scrypt params: {e}"))?;

    let normalized: String = password.nfkc().collect();
    let mut derived = vec![0u8; expected_key.len()];

    scrypt(normalized.as_bytes(), salt_hex.as_bytes(), &params, &mut derived)
        .map_err(|e| format!("Scrypt failed: {e}"))?;

    Ok(bool::from(derived.ct_eq(&expected_key)))
}

/// Generate a 32-character alphanumeric session token (matching better-auth `generateRandomString(32)`).
pub fn generate_session_token() -> String {
    const CHARSET: &[u8] = b"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let mut rng = rand::thread_rng();
    let mut bytes = [0u8; 32];
    rng.fill_bytes(&mut bytes);
    bytes
        .iter()
        .map(|b| CHARSET[(*b as usize) % CHARSET.len()] as char)
        .collect()
}

/// Generate a 6-digit numeric OTP code.
pub fn generate_otp_code() -> String {
    let mut bytes = [0u8; 4];
    rand::thread_rng().fill_bytes(&mut bytes);
    let num = u32::from_le_bytes(bytes) % 1_000_000;
    format!("{num:06}")
}

/// Compute `base64(HMAC-SHA256(secret, value))`.
pub fn make_signature(value: &str, secret: &str) -> String {
    let mut mac =
        HmacSha256::new_from_slice(secret.as_bytes()).expect("HMAC can take key of any size");
    mac.update(value.as_bytes());
    let result = mac.finalize().into_bytes();
    BASE64.encode(result)
}

/// Sign a cookie value in `better-call` format: `encodeURIComponent("${value}.${base64Sig}")`.
pub fn sign_cookie_value(value: &str, secret: &str) -> String {
    let sig = make_signature(value, secret);
    let combined = format!("{value}.{sig}");
    urlencoding::encode(&combined).into_owned()
}

/// Verify and extract the raw token from a `better-call` signed cookie value.
pub fn verify_signed_cookie_value(raw_cookie: &str, secret: &str) -> Option<String> {
    let decoded = urlencoding::decode(raw_cookie).ok()?;
    let (value, sig_b64) = decoded.rsplit_once('.')?;
    let sig_bytes = BASE64.decode(sig_b64).ok()?;

    let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).ok()?;
    mac.update(value.as_bytes());
    let expected = mac.finalize().into_bytes();

    if bool::from(expected.as_slice().ct_eq(&sig_bytes)) {
        Some(value.to_string())
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn verifies_better_auth_scrypt_hash() {
        let hash = "bc0406d85a0a23db9a3649d43afeb66b:0400ceb6466ed8a2f26c63b8709fd2892cd04ef578afaef42e44e723d6c83b788d7a706f5e055522458edcb525d3aea6855c58585458186222b54ee0220c4b51";
        assert!(verify_password(hash, "TestPassword123!").unwrap());
        assert!(!verify_password(hash, "WrongPassword").unwrap());
    }

    #[test]
    fn hashes_and_verifies_password_roundtrip() {
        let h = hash_password("MyNewPass99!").unwrap();
        assert_eq!(h.len(), 161);
        assert!(verify_password(&h, "MyNewPass99!").unwrap());
        assert!(!verify_password(&h, "OtherPass").unwrap());
    }

    #[test]
    fn signs_and_verifies_cookie_roundtrip() {
        let token = generate_session_token();
        let secret = "super-secret";
        let signed = sign_cookie_value(&token, secret);
        assert_eq!(verify_signed_cookie_value(&signed, secret).as_deref(), Some(token.as_str()));
        assert!(verify_signed_cookie_value(&signed, "wrong-secret").is_none());
    }
}
