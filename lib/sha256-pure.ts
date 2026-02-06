/**
 * Pure JavaScript SHA-256 Implementation
 * Fallback for environments where crypto.subtle is not available
 * Based on the SHA-256 algorithm specification
 */

/**
 * Pure JavaScript SHA-256 hash function
 * This is a fallback when crypto.subtle is not available
 */
export function sha256Pure(message: string): string {
  // Convert string to UTF-8 bytes
  const msg = utf8Encode(message);
  
  // SHA-256 constants
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  // Initial hash values
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  // Pre-processing
  const msgLen = msg.length;
  const bitLen = msgLen * 8;
  
  // Append padding
  msg.push(0x80);
  while (msg.length % 64 !== 56) {
    msg.push(0x00);
  }
  
  // Append length (64-bit big-endian)
  for (let i = 7; i >= 0; i--) {
    msg.push((bitLen >>> (i * 8)) & 0xff);
  }

  // Process message in 512-bit chunks
  for (let chunk = 0; chunk < msg.length; chunk += 64) {
    const w: number[] = [];
    
    // Copy chunk into first 16 words
    for (let i = 0; i < 16; i++) {
      w[i] =
        (msg[chunk + i * 4] << 24) |
        (msg[chunk + i * 4 + 1] << 16) |
        (msg[chunk + i * 4 + 2] << 8) |
        msg[chunk + i * 4 + 3];
    }
    
    // Extend the first 16 words into the remaining 48 words
    for (let i = 16; i < 64; i++) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    
    // Initialize working variables
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;
    
    // Main loop
    for (let i = 0; i < 64; i++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    
    // Add the compressed chunk to the current hash value
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }
  
  // Produce the final hash value
  return (
    toHex(h0) +
    toHex(h1) +
    toHex(h2) +
    toHex(h3) +
    toHex(h4) +
    toHex(h5) +
    toHex(h6) +
    toHex(h7)
  );
}

function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

function toHex(value: number): string {
  return value.toString(16).padStart(8, "0");
}

function utf8Encode(str: string): number[] {
  const utf8: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    if (charCode < 0x80) {
      utf8.push(charCode);
    } else if (charCode < 0x800) {
      utf8.push(0xc0 | (charCode >> 6));
      utf8.push(0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      utf8.push(0xe0 | (charCode >> 12));
      utf8.push(0x80 | ((charCode >> 6) & 0x3f));
      utf8.push(0x80 | (charCode & 0x3f));
    } else {
      // Surrogate pair
      i++;
      charCode =
        0x10000 +
        (((charCode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8.push(0xf0 | (charCode >> 18));
      utf8.push(0x80 | ((charCode >> 12) & 0x3f));
      utf8.push(0x80 | ((charCode >> 6) & 0x3f));
      utf8.push(0x80 | (charCode & 0x3f));
    }
  }
  return utf8;
}















